import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { type BrowserContext, type Page } from 'playwright';
import type { CaptureMode, PageCapturePayload } from '../types.js';
import { captureRuntimeScript, type CaptureRuntimeOptions } from '../capture/runtime.js';
import { launchPersistentChromium } from './launch.js';

export interface BrowserSessionOptions extends CaptureRuntimeOptions {
  startUrl: string;
  headless: boolean;
  onShortcutCapture: (page: Page, payload: PageCapturePayload) => Promise<void>;
  onNotice?: (message: string) => void;
}

export class BrowserSession {
  private context?: BrowserContext;
  private businessPage?: Page;
  private profileDir?: string;

  async start(options: BrowserSessionOptions): Promise<Page> {
    this.profileDir = await mkdtemp(path.join(tmpdir(), 'spa-snapshot-profile-'));
    this.context = await launchPersistentChromium(this.profileDir, {
      headless: options.headless,
      viewport: { width: 1440, height: 900 }
    });

    await this.context.exposeBinding('__spaSnapshotSubmit', async (source, rawPayload) => {
      await options.onShortcutCapture(source.page, rawPayload as PageCapturePayload);
    });
    const runtimeOptions = {
      hotkey: options.hotkey,
      captureMode: options.captureMode,
      redactSelectors: options.redactSelectors
    } satisfies CaptureRuntimeOptions;
    await this.context.addInitScript({ content: captureRuntimeScript(runtimeOptions) });

    const pages = this.context.pages();
    this.businessPage = pages[0] ?? await this.context.newPage();
    this.context.on('page', (page) => {
      if (page === this.businessPage) return;
      options.onNotice?.(`New tab detected: ${page.url() || '(loading)'}. Captures remain bound to the active business page.`);
    });
    this.businessPage.on('close', () => options.onNotice?.('The business page was closed.'));
    await this.businessPage.goto(options.startUrl, { waitUntil: 'domcontentloaded' });
    return this.businessPage;
  }

  get page(): Page {
    if (!this.businessPage || this.businessPage.isClosed()) throw new Error('Business page is not available');
    return this.businessPage;
  }

  get captureMode(): CaptureMode {
    return 'exact';
  }

  async close(): Promise<void> {
    await this.context?.close().catch(() => undefined);
    this.context = undefined;
    this.businessPage = undefined;
    if (this.profileDir) {
      const target = this.profileDir;
      this.profileDir = undefined;
      await rm(target, { recursive: true, force: true }).catch(() => undefined);
    }
  }
}
