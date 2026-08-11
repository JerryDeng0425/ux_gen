import { randomUUID } from 'node:crypto';
import path from 'node:path';
import type { Page } from 'playwright';
import { writeCaptureArtifacts, writeRunSummary } from './artifacts/writer.js';
import { checkPageAssertions } from './browser/assertions.js';
import { BrowserSession } from './browser/session.js';
import { captureFromPage } from './capture/runtime.js';
import type { KeypointConfig, PageCapturePayload, RunSummary, ScenarioConfig } from './types.js';

export interface SnapshotRunnerOptions {
  scenario: ScenarioConfig;
  outputRoot: string;
  headless?: boolean;
  log?: (message: string) => void;
}

export class SnapshotRunner {
  readonly runId: string;
  readonly runDir: string;
  readonly summary: RunSummary;
  private readonly session = new BrowserSession();
  private readonly scenario: ScenarioConfig;
  private readonly log: (message: string) => void;
  private capturePromise?: Promise<void>;

  constructor(private readonly options: SnapshotRunnerOptions) {
    this.scenario = options.scenario;
    this.log = options.log ?? console.log;
    this.runId = `${new Date().toISOString().replace(/[:.]/g, '-')}_${randomUUID().slice(0, 8)}`;
    this.runDir = path.resolve(options.outputRoot, this.runId);
    this.summary = {
      schemaVersion: 1,
      runId: this.runId,
      scenarioId: this.scenario.id,
      scenarioVersion: this.scenario.version,
      startedAt: new Date().toISOString(),
      status: 'running',
      browser: { name: 'chromium', headless: options.headless ?? false },
      keypoints: this.scenario.keypoints.map(({ id, name }) => ({ id, name, status: 'pending', attempts: 0 }))
    };
  }

  get page(): Page {
    return this.session.page;
  }

  async start(): Promise<void> {
    await writeRunSummary(this.runDir, this.summary);
    await this.session.start({
      startUrl: this.scenario.startUrl,
      headless: this.options.headless ?? false,
      hotkey: this.scenario.hotkey ?? 'Ctrl+Shift+Y',
      captureMode: this.scenario.captureMode ?? 'exact',
      redactSelectors: this.scenario.redactSelectors ?? [],
      onShortcutCapture: (page, payload) => this.handlePayload(page, payload),
      onNotice: this.log
    });
    this.log(`Browser ready at ${this.session.page.url()}`);
    this.printStatus();
  }

  private nextKeypoint(): KeypointConfig | undefined {
    const record = this.summary.keypoints.find((item) => item.status === 'pending' || item.status === 'failed');
    return record ? this.scenario.keypoints.find((item) => item.id === record.id) : undefined;
  }

  private resolveKeypoint(id?: string): KeypointConfig {
    const keypoint = id ? this.scenario.keypoints.find((item) => item.id === id) : this.nextKeypoint();
    if (!keypoint) throw new Error(id ? `Unknown keypoint ${id}` : 'No pending keypoints');
    return keypoint;
  }

  async capture(id?: string): Promise<void> {
    if (this.capturePromise) throw new Error('capture_in_progress');
    const keypoint = this.resolveKeypoint(id);
    const failures = await checkPageAssertions(this.session.page, keypoint.assertions ?? []);
    if (failures.length > 0) throw new Error(`Keypoint preconditions failed: ${failures.join('; ')}`);
    const selectors = [...(this.scenario.redactSelectors ?? []), ...(keypoint.redactSelectors ?? [])];
    const payload = await captureFromPage(this.session.page, keypoint.id, this.scenario.captureMode ?? 'exact', selectors);
    await this.handlePayload(this.session.page, payload, keypoint);
  }

  private async handlePayload(page: Page, payload: PageCapturePayload, explicitKeypoint?: KeypointConfig): Promise<void> {
    if (this.capturePromise) throw new Error('capture_in_progress');
    const operation = this.commitPayload(page, payload, explicitKeypoint);
    this.capturePromise = operation;
    try {
      await operation;
    } finally {
      this.capturePromise = undefined;
    }
  }

  private async commitPayload(page: Page, payload: PageCapturePayload, explicitKeypoint?: KeypointConfig): Promise<void> {
    const keypoint = explicitKeypoint ?? this.resolveKeypoint(payload.requestedKeypointId);
    const preconditionFailures = await checkPageAssertions(page, keypoint.assertions ?? []);
    if (preconditionFailures.length > 0) throw new Error(`Keypoint preconditions failed: ${preconditionFailures.join('; ')}`);
    const record = this.summary.keypoints.find((item) => item.id === keypoint.id);
    if (!record) throw new Error(`Missing run record for ${keypoint.id}`);
    record.status = 'capturing';
    record.attempts += 1;
    await writeRunSummary(this.runDir, this.summary);
    try {
      if (payload.oversized) throw new Error(payload.warnings.find((warning) => warning.code === 'oversized')?.message ?? 'Snapshot oversized');
      const screenshot = await page.screenshot({
        type: 'png',
        animations: 'disabled',
        mask: (keypoint.maskSelectors ?? []).map((selector) => page.locator(selector))
      });
      const result = await writeCaptureArtifacts({
        runDir: this.runDir,
        runId: this.runId,
        scenarioId: this.scenario.id,
        scenarioVersion: this.scenario.version,
        keypoint,
        payload,
        screenshot
      });
      record.status = result.metadata.status;
      record.artifactMetadata = path.basename(result.metadataPath);
      delete record.error;
      await writeRunSummary(this.runDir, this.summary);
      this.log(`Captured ${keypoint.id}: ${result.metadataPath} (${payload.htmlBytes} bytes, ${payload.warnings.length} warnings)`);
      this.printStatus();
    } catch (error) {
      record.status = 'failed';
      record.error = error instanceof Error ? error.message : String(error);
      await writeRunSummary(this.runDir, this.summary);
      throw error;
    }
  }

  async skip(id: string, reason: string): Promise<void> {
    const keypoint = this.resolveKeypoint(id);
    const record = this.summary.keypoints.find((item) => item.id === keypoint.id)!;
    record.status = 'skipped';
    record.reason = reason || 'No reason provided';
    await writeRunSummary(this.runDir, this.summary);
  }

  printStatus(): void {
    this.log(`Run ${this.runId} | ${this.session.page.url()}`);
    for (const keypoint of this.scenario.keypoints) {
      const record = this.summary.keypoints.find((item) => item.id === keypoint.id)!;
      const marker = record.status === 'pending' ? '->' : '  ';
      this.log(`${marker} ${keypoint.id} [${record.status}] ${keypoint.name}: ${keypoint.instruction}`);
    }
  }

  async finish(): Promise<boolean> {
    const incomplete = this.summary.keypoints.some((item) => item.status === 'pending' || item.status === 'capturing' || item.status === 'failed');
    this.summary.finishedAt = new Date().toISOString();
    this.summary.status = incomplete ? 'incomplete' : 'completed';
    await writeRunSummary(this.runDir, this.summary);
    await this.session.close();
    return !incomplete;
  }

  async closeAsFailed(error: unknown): Promise<void> {
    if (this.summary.status === 'completed') {
      this.log(`Post-run operation failed: ${error instanceof Error ? error.message : String(error)}`);
      return;
    }
    this.summary.finishedAt = new Date().toISOString();
    this.summary.status = 'failed';
    await writeRunSummary(this.runDir, this.summary).catch(() => undefined);
    await this.session.close();
    this.log(`Session failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}
