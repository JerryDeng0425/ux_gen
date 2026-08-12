import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { type BrowserContext, type Page } from 'playwright';
import type { PageCapturePayload } from '../types.js';
import { captureRuntimeScript, type CaptureRuntimeOptions, type CaptureSubmissionResult } from '../capture/runtime.js';
import { launchPersistentChromium } from './launch.js';

export interface BrowserSessionOptions extends CaptureRuntimeOptions {
  startUrl: string;
  headless: boolean;
  onShortcutCapture: (page: Page, payload: PageCapturePayload) => Promise<CaptureSubmissionResult>;
  onNotice?: (message: string) => void;
  onClosed?: () => void;
}

export class BrowserSession {
  private context?: BrowserContext;
  private businessPage?: Page;
  private profileDir?: string;
  private closedPromise?: Promise<void>;
  private resolveClosed?: () => void;

  async start(options: BrowserSessionOptions): Promise<Page> {
    this.closedPromise = new Promise<void>((resolve) => { this.resolveClosed = resolve; });
    this.profileDir = await mkdtemp(path.join(tmpdir(), 'spa-snapshot-profile-'));
    this.context = await launchPersistentChromium(this.profileDir, {
      headless: options.headless,
      viewport: { width: 1440, height: 900 }
    });

    await this.context.exposeBinding('__spaSnapshotSubmit', async (source, rawPayload) => {
      this.businessPage = source.page;
      return options.onShortcutCapture(source.page, rawPayload as PageCapturePayload);
    });
    const runtimeOptions = {
      hotkey: options.hotkey,
      captureMode: options.captureMode,
      captureButton: options.captureButton
    } satisfies CaptureRuntimeOptions;
    await this.context.addInitScript({ content: captureRuntimeScript(runtimeOptions) });

    const pages = this.context.pages();
    this.businessPage = pages[0] ?? await this.context.newPage();
    const activate = (page: Page): void => {
      if (page.isClosed()) return;
      this.businessPage = page;
    };
    this.context.on('page', (page) => {
      if (page === this.businessPage) return;
      this.businessPage = page;
      options.onNotice?.(`New tab detected: ${page.url() || '(loading)'}. It is now the terminal capture target.`);
    });
    await this.context.exposeBinding('__spaSnapshotSetActive', (source) => activate(source.page));
    await this.context.addInitScript(() => {
      window.addEventListener('focus', () => {
        void (window as Window & { __spaSnapshotSetActive?: () => void }).__spaSnapshotSetActive?.();
      });
    });
    this.context.on('close', () => {
      options.onNotice?.('Browser was closed. Finishing the capture session.');
      this.resolveClosed?.();
      this.resolveClosed = undefined;
      options.onClosed?.();
    });
    this.businessPage.on('close', () => options.onNotice?.('The business page was closed.'));
    await this.businessPage.goto(options.startUrl, { waitUntil: 'domcontentloaded' });
    return this.businessPage;
  }

  get page(): Page {
    if (!this.businessPage || this.businessPage.isClosed()) throw new Error('Business page is not available');
    return this.businessPage;
  }

  waitForClose(): Promise<void> {
    return this.closedPromise ?? Promise.resolve();
  }

  async close(): Promise<void> {
    await this.context?.close().catch(() => undefined);
    this.resolveClosed?.();
    this.resolveClosed = undefined;
    this.context = undefined;
    this.businessPage = undefined;
    if (this.profileDir) {
      const target = this.profileDir;
      this.profileDir = undefined;
      await rm(target, { recursive: true, force: true }).catch(() => undefined);
    }
  }
}
