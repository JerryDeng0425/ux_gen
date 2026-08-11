import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { launchChromium } from './browser/launch.js';
import { writeCaptureArtifacts } from './artifacts/writer.js';
import { captureFromPage, captureRuntimeScript } from './capture/runtime.js';
import type { KeypointConfig } from './types.js';

const samples = 20;

function percentile(values: number[], quantile: number): number {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * quantile) - 1)];
}

const browser = await launchChromium({ headless: true });
const temporaryRoot = await mkdtemp(path.join(tmpdir(), 'spa-snapshot-acceptance-'));
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const runtimeOptions = { hotkey: 'Ctrl+Shift+Y', captureMode: 'exact' as const, redactSelectors: [] };
  await page.addInitScript({ content: captureRuntimeScript(runtimeOptions) });
  const navigateHtml = async (html: string) => page.goto(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
  const functionalResults: Record<string, { passed: number; total: number }> = {
    K01: { passed: 0, total: samples },
    K02: { passed: 0, total: samples },
    K03: { passed: 0, total: samples },
    K04: { passed: 0, total: samples }
  };
  const states = [
    { id: 'K01', html: '<!doctype html><html><head><title>Dashboard</title></head><body><h1>Dashboard</h1><p>statistics ready</p></body></html>', check: (html: string) => html.includes('statistics ready') },
    { id: 'K02', html: '<!doctype html><html><head></head><body><input id="search" value="Test"><table><tbody><tr><td>TestUser</td></tr></tbody></table></body></html>', check: (html: string) => html.includes('value="Test"') && html.includes('TestUser') },
    { id: 'K03', html: '<!doctype html><html><head></head><body><dialog id="dialog" open><input value="unsaved draft"></dialog></body></html>', check: (html: string) => html.includes('<dialog id="dialog" open') && html.includes('unsaved draft') },
    { id: 'K04', html: '<!doctype html><html class="theme-dark"><head></head><body><input id="setting" type="checkbox" checked></body></html>', check: (html: string) => html.includes('theme-dark') && html.includes('checked') }
  ];

  for (let iteration = 0; iteration < samples; iteration += 1) {
    for (const state of states) {
      await navigateHtml(state.html);
      const payload = await captureFromPage(page, state.id, 'exact', []);
      if (state.check(payload.html) && !payload.oversized) functionalResults[state.id].passed += 1;
    }
  }

  await navigateHtml('<!doctype html><html><head><title>50k nodes</title></head><body><main id="root"></main></body></html>');
  await page.evaluate(() => {
    const root = document.querySelector('#root')!;
    const fragment = document.createDocumentFragment();
    for (let index = 0; index < 50_000; index += 1) {
      const node = document.createElement('span');
      node.textContent = String(index);
      fragment.append(node);
    }
    root.append(fragment);
  });
  const shortcutLatencyMs: number[] = [];
  const serializationMs: number[] = [];
  for (let iteration = 0; iteration < samples; iteration += 1) {
    const payload = await captureFromPage(page, 'K01', 'exact', []);
    shortcutLatencyMs.push(new Date(payload.cloneStartedAt).getTime() - new Date(payload.requestedAt).getTime());
    serializationMs.push(new Date(payload.capturedAt).getTime() - new Date(payload.cloneStartedAt).getTime());
  }

  await navigateHtml('<!doctype html><html><head><title>Save benchmark</title></head><body><input value="ready"><p>stable</p></body></html>');
  const saveTimeMs: number[] = [];
  const benchmarkKeypoint: KeypointConfig = { id: 'K01', name: 'Save benchmark', instruction: 'Automated benchmark' };
  for (let iteration = 0; iteration < samples; iteration += 1) {
    const payload = await captureFromPage(page, 'K01', 'exact', []);
    const screenshot = await page.screenshot({ type: 'png' });
    const started = performance.now();
    await writeCaptureArtifacts({
      runDir: temporaryRoot,
      runId: 'acceptance',
      scenarioId: 'conformance',
      scenarioVersion: '1.0.0',
      keypoint: benchmarkKeypoint,
      payload,
      screenshot
    });
    saveTimeMs.push(performance.now() - started);
  }

  await navigateHtml('<!doctype html><html><head></head><body><main id="root"></main></body></html>');
  await page.evaluate(() => {
    const root = document.querySelector('#root')!;
    const fragment = document.createDocumentFragment();
    for (let index = 0; index < 150_001; index += 1) fragment.append(document.createElement('i'));
    root.append(fragment);
  });
  const oversizedPayload = await captureFromPage(page, 'K99', 'exact', []);

  const thresholds = {
    shortcutLatencyP95Ms: 200,
    serialization50kP95Ms: 1_000,
    saveP95Ms: 3_000,
    keypointPasses: samples
  };
  const metrics = {
    shortcutLatencyP50Ms: percentile(shortcutLatencyMs, 0.5),
    shortcutLatencyP95Ms: percentile(shortcutLatencyMs, 0.95),
    serialization50kP50Ms: percentile(serializationMs, 0.5),
    serialization50kP95Ms: percentile(serializationMs, 0.95),
    saveP50Ms: Number(percentile(saveTimeMs, 0.5).toFixed(2)),
    saveP95Ms: Number(percentile(saveTimeMs, 0.95).toFixed(2))
  };
  const checks = {
    functional20Of20: Object.values(functionalResults).every((result) => result.passed === samples),
    shortcutLatency: metrics.shortcutLatencyP95Ms <= thresholds.shortcutLatencyP95Ms,
    serialization50k: metrics.serialization50kP95Ms <= thresholds.serialization50kP95Ms,
    saveTime: metrics.saveP95Ms <= thresholds.saveP95Ms,
    oversizedGuard: oversizedPayload.oversized && oversizedPayload.html === ''
  };
  const report = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    environment: { node: process.version, browser: 'chromium', browserVersion: browser.version(), platform: process.platform, viewport: '1280x800' },
    samples,
    functionalResults,
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
  await browser.close();
  await rm(temporaryRoot, { recursive: true, force: true });
}
