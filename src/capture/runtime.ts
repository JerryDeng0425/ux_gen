import type { Page } from 'playwright';
import type { CaptureMode, PageCapturePayload } from '../types.js';

export interface CaptureRuntimeOptions {
  hotkey: string;
  captureMode: CaptureMode;
  captureButton: boolean;
}

export interface CaptureSubmissionResult {
  filePath: string;
}

export function installCaptureRuntime(options: CaptureRuntimeOptions): void {
  type RequestInput = {
    requestedAt?: string;
    requestedLabel?: string;
    requestId?: string;
    mode?: 'exact' | 'settled';
  };
  type RuntimeWindow = Window & {
    __spaSnapshotSerialize?: (input?: RequestInput) => unknown;
    __spaSnapshotRequest?: (input?: RequestInput) => Promise<unknown>;
    __spaSnapshotSubmit?: (payload: unknown) => Promise<{ filePath?: string } | undefined>;
    __spaSnapshotBusy?: boolean;
  };

  const runtimeWindow = window as RuntimeWindow;
  if (runtimeWindow.__spaSnapshotRequest) return;
  const toolAttribute = 'data-spa-snapshot-tool';
  const toolHostId = 'spa-snapshot-capture-host';

  const selectorFor = (element: Element): string => {
    if (element.id) return `#${CSS.escape(element.id)}`;
    const parts: string[] = [];
    let current: Element | null = element;
    while (current && current !== document.documentElement && parts.length < 5) {
      let part = current.tagName.toLowerCase();
      const parent: Element | null = current.parentElement;
      if (parent) {
        const siblings = Array.from(parent.children).filter((child) => child.tagName === current?.tagName);
        if (siblings.length > 1) part += `:nth-of-type(${siblings.indexOf(current) + 1})`;
      }
      parts.unshift(part);
      current = parent;
    }
    return parts.join(' > ') || element.tagName.toLowerCase();
  };

  runtimeWindow.__spaSnapshotSerialize = (input = {}) => {
    const requestedAt = input.requestedAt ?? new Date().toISOString();
    const cloneStartedAt = new Date().toISOString();
    const doctype = document.doctype
      ? `<!DOCTYPE ${document.doctype.name}${document.doctype.publicId ? ` PUBLIC \"${document.doctype.publicId}\"` : ''}${document.doctype.systemId ? ` \"${document.doctype.systemId}\"` : ''}>`
      : '<!DOCTYPE html>';
    const originalRoot = document.documentElement;
    const cloneRoot = originalRoot.cloneNode(true) as HTMLElement;
    const originals = [originalRoot, ...Array.from(originalRoot.querySelectorAll('*'))];
    const clones = [cloneRoot, ...Array.from(cloneRoot.querySelectorAll('*'))];
    const cloneByOriginal = new Map<Element, Element>();
    const warnings: Array<{ code: string; message: string; count?: number }> = [];
    let shadowRootCount = 0;
    let canvasSerialized = 0;
    let canvasFailed = 0;
    const scrollPositions: Array<{ selector: string; top: number; left: number }> = [
      { selector: ':root', top: window.scrollY, left: window.scrollX }
    ];
    cloneRoot.setAttribute('data-spa-snapshot-window-scroll-top', String(window.scrollY));
    cloneRoot.setAttribute('data-spa-snapshot-window-scroll-left', String(window.scrollX));

    for (let index = 0; index < Math.min(originals.length, clones.length); index += 1) {
      const original = originals[index];
      const clone = clones[index];
      cloneByOriginal.set(original, clone);
      if (original.hasAttribute(toolAttribute)) continue;

      if (original.scrollTop !== 0 || original.scrollLeft !== 0) {
        scrollPositions.push({ selector: selectorFor(original), top: original.scrollTop, left: original.scrollLeft });
        clone.setAttribute('data-spa-snapshot-scroll-top', String(original.scrollTop));
        clone.setAttribute('data-spa-snapshot-scroll-left', String(original.scrollLeft));
      }

      if (original instanceof HTMLInputElement && clone instanceof HTMLInputElement) {
        const type = original.type.toLowerCase();
        clone.setAttribute('value', original.value);
        if (type === 'checkbox' || type === 'radio') clone.toggleAttribute('checked', original.checked);
      } else if (original instanceof HTMLTextAreaElement && clone instanceof HTMLTextAreaElement) {
        clone.textContent = original.value;
      } else if (original instanceof HTMLOptionElement && clone instanceof HTMLOptionElement) {
        clone.toggleAttribute('selected', original.selected);
      } else if (original instanceof HTMLDetailsElement && clone instanceof HTMLDetailsElement) {
        clone.toggleAttribute('open', original.open);
      } else if (original instanceof HTMLDialogElement && clone instanceof HTMLDialogElement) {
        clone.toggleAttribute('open', original.open);
      } else if (original instanceof HTMLImageElement && clone instanceof HTMLImageElement && original.currentSrc) {
        clone.setAttribute('src', original.currentSrc);
        clone.removeAttribute('srcset');
      }

      if (original.shadowRoot) {
        shadowRootCount += 1;
        warnings.push({ code: 'shadow_dom_present', message: `Open Shadow DOM cannot be represented by outerHTML: ${selectorFor(original)}` });
      }
    }

    const canvasTotal = document.querySelectorAll('canvas').length;
    if (canvasTotal > 0) {
      canvasFailed = canvasTotal;
      warnings.push({ code: 'canvas_unreadable', message: 'Canvas pixels are not embedded in HTML-only captures', count: canvasTotal });
    }

    const iframeCount = document.querySelectorAll('iframe').length;
    if (iframeCount > 0) warnings.push({ code: 'iframe_present', message: 'Iframe DOM is not embedded in the snapshot', count: iframeCount });

    cloneRoot.querySelectorAll(`[${toolAttribute}]`).forEach((node) => node.remove());
    cloneRoot.querySelectorAll('script').forEach((node) => node.remove());
    cloneRoot.querySelectorAll('meta[http-equiv]').forEach((node) => {
      if ((node.getAttribute('http-equiv') ?? '').toLowerCase() === 'refresh') node.remove();
    });
    cloneRoot.querySelectorAll('*').forEach((element) => {
      for (const attribute of Array.from(element.attributes)) {
        const name = attribute.name.toLowerCase();
        if (name.startsWith('on')) element.removeAttribute(attribute.name);
        if ((name === 'href' || name === 'src' || name === 'action' || name === 'formaction') && /^\s*javascript:/i.test(attribute.value)) {
          element.removeAttribute(attribute.name);
        }
      }
    });

    const capturedAt = new Date().toISOString();
    const head = cloneRoot.querySelector('head');
    if (head) {
      head.querySelectorAll('base').forEach((node) => node.remove());
      const base = document.createElement('base');
      base.href = document.baseURI;
      head.prepend(base);
      const metadata: Record<string, string> = {
        'spa-snapshot-source': location.href,
        'spa-snapshot-requested-at': requestedAt,
        'spa-snapshot-clone-started-at': cloneStartedAt,
        'spa-snapshot-captured-at': capturedAt
      };
      for (const [name, content] of Object.entries(metadata)) {
        const meta = document.createElement('meta');
        meta.setAttribute('name', name);
        meta.setAttribute('content', content);
        head.append(meta);
      }
    }

    let html = `${doctype}\n${cloneRoot.outerHTML}`;
    const htmlBytes = new TextEncoder().encode(html).byteLength;
    const nodeCount = originals.filter((node) => !node.hasAttribute(toolAttribute)).length;
    const oversized = nodeCount > 150_000 || htmlBytes > 25 * 1024 * 1024;
    if (oversized) {
      warnings.push({ code: 'oversized', message: `Snapshot exceeds limits: ${nodeCount} nodes, ${htmlBytes} bytes` });
      html = '';
    }
    const sanitizedUrl = location.href;
    const routeUrl = new URL(location.href);
    const route = `${routeUrl.pathname}${routeUrl.search}${routeUrl.hash}`;

    return {
      html,
      doctype,
      requestedAt,
      cloneStartedAt,
      capturedAt,
      originalUrl: sanitizedUrl,
      sanitizedUrl,
      route,
      title: document.title,
      nodeCount,
      htmlBytes,
      viewport: { width: window.innerWidth, height: window.innerHeight },
      dpr: window.devicePixelRatio,
      scrollPositions,
      specialContent: {
        canvasTotal,
        canvasSerialized,
        canvasFailed,
        iframeCount,
        shadowRootCount
      },
      warnings,
      requestedLabel: input.requestedLabel,
      requestId: input.requestId,
      oversized
    };
  };

  const waitForSettled = async (): Promise<void> => {
    await new Promise<void>((resolve) => {
      let quietTimer = window.setTimeout(resolve, 300);
      const maxTimer = window.setTimeout(() => {
        observer.disconnect();
        window.clearTimeout(quietTimer);
        resolve();
      }, 2_000);
      const observer = new MutationObserver(() => {
        window.clearTimeout(quietTimer);
        quietTimer = window.setTimeout(() => {
          observer.disconnect();
          window.clearTimeout(maxTimer);
          resolve();
        }, 300);
      });
      observer.observe(document.documentElement, { subtree: true, childList: true, attributes: true, characterData: true });
    });
  };

  runtimeWindow.__spaSnapshotRequest = async (input = {}) => {
    if (runtimeWindow.__spaSnapshotBusy) throw new Error('capture_in_progress');
    runtimeWindow.__spaSnapshotBusy = true;
    const requestedAt = new Date().toISOString();
    try {
      if ((input.mode ?? options.captureMode) === 'settled') await waitForSettled();
      return runtimeWindow.__spaSnapshotSerialize?.({
        requestedAt,
        requestedLabel: input.requestedLabel,
        requestId: input.requestId,
      });
    } finally {
      runtimeWindow.__spaSnapshotBusy = false;
    }
  };

  let hotkeyLatched = false;
  let button: HTMLButtonElement | undefined;
  const setButtonState = (text: string, busy: boolean): void => {
    if (!button) return;
    button.textContent = text;
    button.disabled = busy;
  };
  const submitCapture = async (source: 'hotkey' | 'button'): Promise<void> => {
    if (!runtimeWindow.__spaSnapshotSubmit) return;
    const now = Date.now();
    setButtonState('Capturing…', true);
    try {
      const payload = await runtimeWindow.__spaSnapshotRequest?.({ requestId: `${now}-${source}` });
      const result = await runtimeWindow.__spaSnapshotSubmit(payload);
      setButtonState('Saved ✓', false);
      if (button && result?.filePath) button.title = `Saved: ${result.filePath}`;
      window.setTimeout(() => setButtonState('Capture HTML', false), 1_200);
    } catch {
      setButtonState('Capture failed', false);
      window.setTimeout(() => setButtonState('Capture HTML', false), 1_500);
    }
  };

  const hotkeyParts = options.hotkey.toLowerCase().split('+').map((part) => part.trim());
  const matchesHotkey = (event: KeyboardEvent): boolean => {
    const expectedKey = hotkeyParts.at(-1) ?? '';
    const actualKey = event.code.toLowerCase() === `key${expectedKey}` ? expectedKey : event.key.toLowerCase();
    return actualKey === expectedKey
      && event.ctrlKey === hotkeyParts.includes('ctrl')
      && event.shiftKey === hotkeyParts.includes('shift')
      && event.altKey === hotkeyParts.includes('alt')
      && event.metaKey === hotkeyParts.includes('meta');
  };
  const onHotkeyDown = (event: KeyboardEvent): void => {
    if (!matchesHotkey(event) || !runtimeWindow.__spaSnapshotSubmit) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if (hotkeyLatched || event.repeat) return;
    hotkeyLatched = true;
    void submitCapture('hotkey');
  };
  const onHotkeyUp = (event: KeyboardEvent): void => {
    if (!matchesHotkey(event)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    hotkeyLatched = false;
  };
  window.addEventListener('keydown', onHotkeyDown, true);
  window.addEventListener('keyup', onHotkeyUp, true);
  window.addEventListener('blur', () => { hotkeyLatched = false; });

  const mountCaptureButton = (): void => {
    if (!options.captureButton || !document.body || document.getElementById(toolHostId)) return;
    const host = document.createElement('div');
    host.id = toolHostId;
    host.setAttribute(toolAttribute, 'true');
    host.style.cssText = 'position:fixed;right:18px;bottom:18px;z-index:2147483647';
    const shadow = host.attachShadow({ mode: 'open' });
    button = document.createElement('button');
    button.type = 'button';
    button.textContent = 'Capture HTML';
    button.title = `${options.hotkey} · Save the currently rendered DOM as HTML`;
    button.setAttribute('aria-label', 'Capture rendered DOM as HTML');
    button.style.cssText = 'all:initial;box-sizing:border-box;display:inline-block;padding:10px 14px;border:1px solid #fff;border-radius:8px;background:#111827;color:#fff;font:600 13px/1.2 system-ui,sans-serif;box-shadow:0 4px 16px #0005;cursor:pointer;user-select:none';
    button.addEventListener('click', () => void submitCapture('button'));
    shadow.append(button);
    document.body.append(host);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mountCaptureButton, { once: true });
  else mountCaptureButton();
  const remountObserver = new MutationObserver(() => mountCaptureButton());
  remountObserver.observe(document.documentElement, { childList: true, subtree: true });
}

export function captureRuntimeScript(options: CaptureRuntimeOptions): string {
  return `(() => { const __name = (target) => target; (${installCaptureRuntime.toString()})(${JSON.stringify(options)}); })();`;
}

export async function captureFromPage(
  page: Page,
  label: string | undefined,
  mode: CaptureMode
): Promise<PageCapturePayload> {
  return page.evaluate(async ({ requestedLabel, captureMode }) => {
    const request = (window as Window & { __spaSnapshotRequest?: (input: unknown) => Promise<unknown> }).__spaSnapshotRequest;
    if (!request) throw new Error('Capture runtime is not installed');
    return request({ requestedLabel, mode: captureMode });
  }, { requestedLabel: label, captureMode: mode }) as Promise<PageCapturePayload>;
}
