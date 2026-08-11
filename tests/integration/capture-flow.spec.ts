import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';
import { createServer, type ViteDevServer } from 'vite';
import { SnapshotRunner } from '../../src/runner.js';
import { loadScenario } from '../../src/scenarios/loader.js';
import { validateRun } from '../../src/validation/validator.js';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const fixtureRoot = path.join(repositoryRoot, 'tests/fixtures/conformance-spa');
let server: ViteDevServer;
let baseUrl: string;

test.beforeAll(async () => {
  server = await createServer({ root: fixtureRoot, server: { host: '127.0.0.1', port: 0 }, logLevel: 'error' });
  await server.listen();
  baseUrl = server.resolvedUrls?.local[0] ?? '';
});

test.afterAll(async () => {
  await server.close();
});

test('captures four keypoints, writes atomic artifacts, and validates them', async ({}, testInfo) => {
  const scenario = await loadScenario(path.join(repositoryRoot, 'scenarios/conformance.json'));
  scenario.startUrl = `${baseUrl}#/dashboard`;
  const runner = new SnapshotRunner({ scenario, outputRoot: testInfo.outputPath('artifacts'), headless: true, log: () => undefined });
  await runner.start();
  try {
    await expect(runner.page.getByTestId('dashboard')).toBeVisible();
    await runner.capture('K01');

    await runner.page.locator('a[href="#/users"]').click();
    await runner.page.locator('#name').fill('Ada Lovelace');
    await runner.page.locator('#notes').fill('runtime notes');
    await runner.page.locator('#enabled').check();
    await runner.page.locator('#choice').selectOption('beta');
    await runner.capture('K02');

    await runner.page.locator('#open-dialog').click();
    await runner.page.locator('#dialog-value').fill('unsaved draft');
    await runner.capture('K03');

    await runner.page.locator('#edit-dialog').evaluate((dialog: HTMLDialogElement) => dialog.close());
    await runner.page.locator('a[href="#/preferences"]').click();
    await runner.page.locator('#theme-toggle').click();
    await runner.capture('K04');
    expect(await runner.finish()).toBe(true);
  } catch (error) {
    await runner.closeAsFailed(error);
    throw error;
  }

  const files = await import('node:fs/promises').then(({ readdir }) => readdir(runner.runDir));
  expect(files.filter((file) => file.endsWith('.html'))).toHaveLength(4);
  expect(files.filter((file) => file.endsWith('.png'))).toHaveLength(4);
  expect(files.filter((file) => /^k\d+.*\.json$/i.test(file))).toHaveLength(4);
  const report = await validateRun(runner.runDir);
  expect(report.passed).toBe(true);
  expect(report.results).toHaveLength(4);

  const firstMetadata = runner.summary.keypoints[0].artifactMetadata!;
  const metadata = JSON.parse(await readFile(path.join(runner.runDir, firstMetadata), 'utf8')) as { files: { html: string } };
  const htmlPath = path.join(runner.runDir, metadata.files.html);
  const originalHtml = await readFile(htmlPath, 'utf8');
  await writeFile(htmlPath, `${originalHtml}<!--tampered-->`);
  const tamperedReport = await validateRun(runner.runDir, { writeReport: false });
  expect(tamperedReport.passed).toBe(false);
  expect(tamperedReport.results[0].issues.some((issue) => issue.code === 'html_hash_mismatch')).toBe(true);
  await writeFile(htmlPath, originalHtml);
});
