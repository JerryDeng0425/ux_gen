import { randomUUID } from 'node:crypto';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import type { Page } from 'playwright';
import { writeHtmlCapture } from './artifacts/writer.js';
import { BrowserSession } from './browser/session.js';
import { captureFromPage, type CaptureSubmissionResult } from './capture/runtime.js';
import type { HtmlCaptureRecord, PageCapturePayload, ScenarioConfig } from './types.js';

export interface SnapshotRunnerOptions {
  scenario: ScenarioConfig;
  outputRoot: string;
  headless?: boolean;
  log?: (message: string) => void;
}

export class SnapshotRunner {
  readonly sessionId: string;
  readonly runDir: string;
  readonly captures: HtmlCaptureRecord[] = [];
  private readonly session = new BrowserSession();
  private readonly scenario: ScenarioConfig;
  private readonly log: (message: string) => void;
  private captureQueue: Promise<unknown> = Promise.resolve();
  private closed = false;

  constructor(private readonly options: SnapshotRunnerOptions) {
    this.scenario = options.scenario;
    this.log = options.log ?? console.log;
    this.sessionId = `${new Date().toISOString().replace(/[:.]/g, '-')}_${randomUUID().slice(0, 8)}`;
    this.runDir = path.resolve(options.outputRoot);
  }

  get runId(): string {
    return this.sessionId;
  }

  get page(): Page {
    return this.session.page;
  }

  async start(): Promise<void> {
    await mkdir(this.runDir, { recursive: true });
    await this.session.start({
      startUrl: this.scenario.startUrl,
      headless: this.options.headless ?? false,
      hotkey: this.scenario.hotkey ?? 'Ctrl+Shift+Y',
      captureMode: this.scenario.captureMode ?? 'exact',
      captureButton: this.scenario.captureButton ?? true,
      onShortcutCapture: (_page, payload) => this.enqueuePayload(payload),
      onNotice: this.log
    });
    this.log(`Browser ready at ${this.session.page.url()}`);
    this.log(`Capture whenever you want: click “Capture HTML”, press ${this.scenario.hotkey ?? 'Ctrl+Shift+Y'} while the page has focus, or type capture [label].`);
    this.printStatus();
  }

  async capture(label?: string): Promise<HtmlCaptureRecord> {
    if (this.closed) throw new Error('Session is closed');
    const normalizedLabel = label?.trim() || undefined;
    const payload = await captureFromPage(
      this.session.page,
      normalizedLabel,
      this.scenario.captureMode ?? 'exact'
    );
    const result = await this.enqueuePayload(payload, normalizedLabel);
    return this.captures.find((record) => record.filePath === result.filePath)!;
  }

  private enqueuePayload(payload: PageCapturePayload, label = payload.requestedLabel): Promise<CaptureSubmissionResult> {
    const operation = this.captureQueue.then(() => this.commitPayload(payload, label));
    this.captureQueue = operation.catch(() => undefined);
    return operation;
  }

  private async commitPayload(payload: PageCapturePayload, label?: string): Promise<CaptureSubmissionResult> {
    if (this.closed) throw new Error('Session is closed');
    const record = await writeHtmlCapture({
      outputDir: this.runDir,
      sessionId: this.sessionId,
      captureIndex: this.captures.length + 1,
      label,
      payload
    });
    this.captures.push(record);
    this.log(`Saved capture ${record.captureId}: ${record.filePath} (${record.htmlBytes} bytes, ${record.warningCount} warnings)`);
    return { filePath: record.filePath };
  }

  printStatus(): void {
    const latest = this.captures.at(-1);
    this.log(`Session ${this.sessionId} | ${this.session.page.url()} | ${this.captures.length} HTML capture(s)`);
    if (latest) this.log(`Latest: ${latest.filePath}`);
  }

  async finish(): Promise<boolean> {
    await this.captureQueue;
    this.closed = true;
    await this.session.close();
    this.log(`Session finished with ${this.captures.length} HTML capture(s) in ${this.runDir}`);
    return true;
  }

  async waitForBrowserClose(): Promise<void> {
    await this.session.waitForClose();
    await this.captureQueue.catch(() => undefined);
    this.closed = true;
    this.log(`Browser closed; preserved ${this.captures.length} HTML capture(s) in ${this.runDir}`);
  }

  async closeAsFailed(error: unknown): Promise<void> {
    this.closed = true;
    await this.captureQueue.catch(() => undefined);
    await this.session.close();
    this.log(`Session failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}
