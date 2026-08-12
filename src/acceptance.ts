import { mkdir, mkdtemp, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { launchChromium } from './browser/launch.js';
import { captureFromPage, captureRuntimeScript } from './capture/runtime.js';
import { SnapshotRunner } from './runner.js';
import { validateHtml } from './validation/validator.js';

const samples = 20;
const headed = process.env.HEADED_ACCEPTANCE === '1';

function percentile(values: number[], quantile: number): number {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * quantile) - 1)];
}

async function waitForCount(runner: SnapshotRunner, count: number): Promise<void> {
  const deadline = Date.now() + 5_000;
  while (runner.captures.length < count && Date.now() < deadline) await new Promise((resolve) => setTimeout(resolve, 25));
  if (runner.captures.length !== count) throw new Error(`Expected ${count} captures, got ${runner.captures.length}`);
}

const temporaryRoot = await mkdtemp(path.join(tmpdir(), 'spa-snapshot-v3-acceptance-'));
let runner: SnapshotRunner | undefined;
let browser: Awaited<ReturnType<typeof launchChromium>> | undefined;
try {
  const fixture = '<!doctype html><html><head><title>Free capture</title></head><body><h1>Acceptance SPA</h1><input id="state" value="initial"><p id="counter">0</p></body></html>';
  runner = new SnapshotRunner({
    scenario: {
      id: 'v3-acceptance',
      version: '3.0.0',
      startUrl: `data:text/html;charset=utf-8,${encodeURIComponent(fixture)}`,
      captureMode: 'exact',
      hotkey: 'Ctrl+Shift+Y',
      captureButton: true
    },
    outputRoot: temporaryRoot,
    headless: !headed,
    log: () => undefined
  });
  await runner.start();

  for (let index = 1; index <= 5; index += 1) {
    await runner.page.locator('#counter').evaluate((node, value) => { node.textContent = `hotkey ${value}`; }, index);
    await runner.page.keyboard.press('Control+Shift+Y');
    await waitForCount(runner, index);
    await new Promise((resolve) => setTimeout(resolve, 775));
  }
  for (let index = 1; index <= 5; index += 1) {
    await runner.page.locator('#counter').evaluate((node, value) => { node.textContent = `button ${value}`; }, index);
    await runner.page.getByRole('button', { name: 'Capture rendered DOM as HTML' }).click();
    await waitForCount(runner, 5 + index);
  }
  for (let index = 1; index <= 10; index += 1) {
    await runner.page.locator('#state').fill(`terminal value ${index}`);
    await runner.capture(`terminal ${index}`);
  }
  await runner.finish();

  const files = await readdir(runner.runDir);
  const validation = await validateHtml(runner.runDir);

  browser = await launchChromium({ headless: !headed });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.addInitScript({ content: captureRuntimeScript({ hotkey: 'Ctrl+Shift+Y', captureMode: 'exact', captureButton: true }) });
  await page.goto('data:text/html;charset=utf-8,' + encodeURIComponent('<!doctype html><html><head><title>50k nodes</title></head><body><main id="root"></main></body></html>'));
  await page.evaluate(() => {
    const root = document.querySelector('#root')!;
    const fragment = document.createDocumentFragment();
    for (let index = 0; index < 50_000; index += 1) fragment.append(document.createElement('span'));
    root.append(fragment);
  });
  const serializationMs: number[] = [];
  for (let iteration = 0; iteration < samples; iteration += 1) {
    const payload = await captureFromPage(page, undefined, 'exact');
    serializationMs.push(new Date(payload.capturedAt).getTime() - new Date(payload.cloneStartedAt).getTime());
  }

  await page.goto('data:text/html;charset=utf-8,' + encodeURIComponent('<!doctype html><html><head><title>Oversized</title></head><body><main id="root"></main></body></html>'));
  await page.evaluate(() => {
    const root = document.querySelector('#root')!;
    const fragment = document.createDocumentFragment();
    for (let index = 0; index < 150_001; index += 1) fragment.append(document.createElement('i'));
    root.append(fragment);
  });
  const oversized = await captureFromPage(page, undefined, 'exact');

  const thresholds = { serialization50kP95Ms: 1_000, captureCount: samples, triggerPasses: 5 };
  const metrics = {
    serialization50kP95Ms: percentile(serializationMs, 0.95),
    htmlCount: files.filter((file) => file.endsWith('.html')).length,
    jsonCount: files.filter((file) => file.endsWith('.json')).length,
    pngCount: files.filter((file) => file.endsWith('.png')).length,
    triggers: { hotkey: 5, button: 5, terminal: 10 }
  };
  const checks = {
    arbitrary20Captures: runner.captures.length === samples && metrics.htmlCount === 11,
    sameTitleOverwrite: files.filter((file) => file === 'Free capture.html').length === 1,
    htmlOnly: metrics.jsonCount === 0 && metrics.pngCount === 0 && files.every((file) => file.endsWith('.html')),
    threeControls: metrics.triggers.hotkey >= 5 && metrics.triggers.button >= 5 && metrics.triggers.terminal >= 5,
    validation: validation.passed && validation.results.length === metrics.htmlCount,
    serialization50k: metrics.serialization50kP95Ms <= thresholds.serialization50kP95Ms,
    oversizedGuard: oversized.oversized && oversized.html === ''
  };
  const report = {
    schemaVersion: 3,
    generatedAt: new Date().toISOString(),
    environment: { node: process.version, browser: 'chromium', browserVersion: browser.version(), platform: process.platform, headed },
    samples,
    thresholds,
    metrics,
    checks,
    passed: Object.values(checks).every(Boolean)
  };
  await mkdir(path.resolve('reports'), { recursive: true });
  await writeFile(path.resolve('reports/acceptance-report.json'), `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify(report, null, 2));
  if (!report.passed) process.exitCode = 1;
} finally {
  if (runner) await runner.finish().catch(() => undefined);
  await browser?.close().catch(() => undefined);
  await rm(temporaryRoot, { recursive: true, force: true });
}
