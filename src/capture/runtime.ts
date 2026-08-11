import type { Page } from 'playwright';
import type { CaptureMode, PageCapturePayload } from '../types.js';

export interface CaptureRuntimeOptions {
  hotkey: string;
  captureMode: CaptureMode;
  redactSelectors: string[];
}

export function installCaptureRuntime(options: CaptureRuntimeOptions): void {
  type RuntimeWindow = Window & {
    __spaSnapshotSerialize?: (input?: { requestedAt?: string; requestedKeypointId?: string; redactSelectors?: string[] }) => unknown;
    __spaSnapshotRequest?: (input?: { requestedKeypointId?: string; mode?: 'exact' | 'settled'; redactSelectors?: string[] }) => Promise<unknown>;
    __spaSnapshotSubmit?: (payload: unknown) => Promise<unknown>;
    __spaSnapshotBusy?: boolean;
  };

  const runtimeWindow = window as RuntimeWindow;
  if (runtimeWindow.__spaSnapshotRequest) return;

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

  const sanitizeUrl = (input: string, keepHash = false): string => {
    try {
      const url = new URL(input);
      if (!keepHash) url.hash = '';
      const sensitive = /token|code|key|secret|password|auth|session/i;
      for (const key of Array.from(url.searchParams.keys())) {
        if (sensitive.test(key)) url.searchParams.set(key, '[REDACTED]');
      }
      return url.toString();
    } catch {
      return input.split('#')[0] ?? input;
    }
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

    for (let index = 0; index < Math.min(originals.length, clones.length); index += 1) {
      const original = originals[index];
      const clone = clones[index];
      cloneByOriginal.set(original, clone);

      if (original.scrollTop !== 0 || original.scrollLeft !== 0) {
        scrollPositions.push({ selector: selectorFor(original), top: original.scrollTop, left: original.scrollLeft });
      }

      if (original instanceof HTMLInputElement && clone instanceof HTMLInputElement) {
        const type = original.type.toLowerCase();
        if (type === 'password' || type === 'file') {
          clone.removeAttribute('value');
          clone.setAttribute('data-snapshot-redacted', type);
        } else {
          clone.setAttribute('value', original.value);
        }
        if (type === 'checkbox' || type === 'radio') {
          clone.toggleAttribute('checked', original.checked);
        }
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

    for (const selector of input.redactSelectors ?? options.redactSelectors) {
      try {
        for (const original of Array.from(document.querySelectorAll(selector))) {
          const clone = cloneByOriginal.get(original);
          if (clone) {
            clone.textContent = '[REDACTED]';
            clone.setAttribute('data-snapshot-redacted', 'selector');
            if (clone instanceof HTMLInputElement || clone instanceof HTMLTextAreaElement) clone.setAttribute('value', '');
          }
        }
      } catch {
        // Invalid selectors are rejected by scenario verification; ignore defensively in-page.
      }
    }

    for (const original of Array.from(document.querySelectorAll('canvas'))) {
      const clone = cloneByOriginal.get(original);
      if (!(original instanceof HTMLCanvasElement) || !clone) continue;
      try {
        const image = document.createElement('img');
        image.src = original.toDataURL('image/png');
        image.width = original.width;
        image.height = original.height;
        image.alt = 'Canvas snapshot';
        image.setAttribute('data-snapshot-canvas', 'true');
        clone.replaceWith(image);
        canvasSerialized += 1;
      } catch {
        canvasFailed += 1;
        warnings.push({ code: 'canvas_unreadable', message: `Canvas could not be serialized: ${selectorFor(original)}` });
      }
    }

    const iframeCount = document.querySelectorAll('iframe').length;
    if (iframeCount > 0) warnings.push({ code: 'iframe_present', message: 'Iframe DOM is not embedded in the snapshot', count: iframeCount });

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

    const head = cloneRoot.querySelector('head');
    if (head) {
      head.querySelectorAll('base').forEach((node) => node.remove());
      const base = document.createElement('base');
      base.href = sanitizeUrl(document.baseURI);
      head.prepend(base);
      const metadata: Record<string, string> = {
        'spa-snapshot-source': sanitizeUrl(location.href),
        'spa-snapshot-requested-at': requestedAt,
        'spa-snapshot-clone-started-at': cloneStartedAt,
        'spa-snapshot-captured-at': new Date().toISOString()
      };
      for (const [name, content] of Object.entries(metadata)) {
        const meta = document.createElement('meta');
        meta.setAttribute('name', name);
        meta.setAttribute('content', content);
        head.append(meta);
      }
    }

    const capturedAt = new Date().toISOString();
    let html = `${doctype}\n${cloneRoot.outerHTML}`;
    const htmlBytes = new TextEncoder().encode(html).byteLength;
    const nodeCount = originals.length;
    const oversized = nodeCount > 150_000 || htmlBytes > 25 * 1024 * 1024;
    if (oversized) {
      warnings.push({ code: 'oversized', message: `Snapshot exceeds limits: ${nodeCount} nodes, ${htmlBytes} bytes` });
      html = '';
    }
    const sanitizedUrl = sanitizeUrl(location.href);
    const routeUrl = new URL(sanitizeUrl(location.href, true));
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
        canvasTotal: document.querySelectorAll('canvas').length,
        canvasSerialized,
        canvasFailed,
        iframeCount,
        shadowRootCount
      },
      warnings,
      requestedKeypointId: input.requestedKeypointId,
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
        requestedKeypointId: input.requestedKeypointId,
        redactSelectors: input.redactSelectors
      });
    } finally {
      runtimeWindow.__spaSnapshotBusy = false;
    }
  };

  const hotkeyParts = options.hotkey.toLowerCase().split('+').map((part) => part.trim());
  document.addEventListener('keydown', (event) => {
    const key = hotkeyParts.at(-1);
    const matches = event.key.toLowerCase() === key
      && event.ctrlKey === hotkeyParts.includes('ctrl')
      && event.shiftKey === hotkeyParts.includes('shift')
      && event.altKey === hotkeyParts.includes('alt');
    if (!matches || !runtimeWindow.__spaSnapshotSubmit) return;
    event.preventDefault();
    void runtimeWindow.__spaSnapshotRequest?.().then((payload) => runtimeWindow.__spaSnapshotSubmit?.(payload)).catch(() => undefined);
  }, true);
}

export function captureRuntimeScript(options: CaptureRuntimeOptions): string {
  return `(() => { const __name = (target) => target; (${installCaptureRuntime.toString()})(${JSON.stringify(options)}); })();`;
}

export async function captureFromPage(
  page: Page,
  keypointId: string,
  mode: CaptureMode,
  redactSelectors: string[]
): Promise<PageCapturePayload> {
  return page.evaluate(async ({ requestedKeypointId, captureMode, selectors }) => {
    const request = (window as Window & { __spaSnapshotRequest?: (input: unknown) => Promise<unknown> }).__spaSnapshotRequest;
    if (!request) throw new Error('Capture runtime is not installed');
    return request({ requestedKeypointId, mode: captureMode, redactSelectors: selectors });
  }, { requestedKeypointId: keypointId, captureMode: mode, selectors: redactSelectors }) as Promise<PageCapturePayload>;
}
