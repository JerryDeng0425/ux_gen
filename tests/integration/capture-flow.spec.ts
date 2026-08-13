import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';
import { createServer, type ViteDevServer } from 'vite';
import { SnapshotRunner } from '../../src/runner.js';
import { loadScenario } from '../../src/scenarios/loader.js';
import { validateHtml } from '../../src/validation/validator.js';

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

test('captures freely through all three controls and keeps only the latest HTML per page name', async ({}, testInfo) => {
  const scenario = await loadScenario(path.join(repositoryRoot, 'scenarios/conformance.json'));
  scenario.startUrl = `${baseUrl}#/dashboard`;
  const runner = new SnapshotRunner({ scenario, outputRoot: testInfo.outputPath('artifacts'), headless: true, log: () => undefined });
  await runner.start();
  try {
    await expect(runner.page.getByTestId('dashboard')).toBeVisible();

    await runner.page.keyboard.press('Control+Shift+Y');
    await expect.poll(() => runner.captures.length).toBe(1);

    await runner.page.getByRole('button', { name: 'Capture rendered DOM as HTML' }).click();
    await expect.poll(() => runner.captures.length).toBe(2);

    await runner.capture('dashboard terminal');
    await runner.page.locator('a[href="#/users"]').click();
    await runner.page.locator('#name').fill('Ada Lovelace');
    await runner.page.locator('#notes').fill('runtime notes');
    await runner.page.locator('#enabled').check();
    await runner.page.locator('#choice').selectOption('beta');
    await runner.capture('users edited');

    await runner.page.locator('#open-dialog').click();
    await runner.page.locator('#dialog-value').fill('unsaved draft');
    await runner.capture('dialog draft');

    await runner.page.locator('#edit-dialog').evaluate((dialog: HTMLDialogElement) => dialog.close());
    await runner.page.locator('a[href="#/preferences"]').click();
    await runner.page.locator('#theme-toggle').click();
    await runner.capture('dark preferences');

    while (runner.captures.length < 20) await runner.capture(`free ${runner.captures.length + 1}`);
    expect(await runner.finish()).toBe(true);
  } catch (error) {
    await runner.closeAsFailed(error);
    throw error;
  }

  const files = await readdir(runner.runDir);
  expect(runner.captures).toHaveLength(20);
  expect(files.filter((file) => file.endsWith('.html'))).toHaveLength(19);
  expect(files.filter((file) => file === 'Snapshot Conformance SPA.html')).toHaveLength(1);
  expect(files.filter((file) => file.endsWith('.json'))).toHaveLength(0);
  expect(files.filter((file) => file.endsWith('.png'))).toHaveLength(0);
  const report = await validateHtml(runner.runDir);
  expect(report.passed).toBe(true);
  expect(report.results).toHaveLength(19);

  const firstPath = runner.captures[0].filePath;
  const html = await readFile(firstPath, 'utf8');
  expect(html).toContain('spa-snapshot-session-id');
  expect(html).toContain('spa-snapshot-capture-id');
  expect(html).not.toContain('spa-snapshot-capture-host');
  await writeFile(firstPath, `${html}<!--trailing corruption-->`);
  const tampered = await validateHtml(firstPath);
  expect(tampered.passed).toBe(false);
  expect(tampered.results[0].issues.some((issue) => issue.code === 'html_truncated')).toBe(true);
  await writeFile(firstPath, html);
});

test('hotkey repeat writes once and closing the browser preserves completed HTML', async ({}, testInfo) => {
  const scenario = await loadScenario(path.join(repositoryRoot, 'scenarios/conformance.json'));
  scenario.startUrl = `${baseUrl}#/dashboard`;
  const runner = new SnapshotRunner({ scenario, outputRoot: testInfo.outputPath('baseline'), headless: true, log: () => undefined });
  await runner.start();
  await runner.page.evaluate(() => {
    const init = { key: 'y', code: 'KeyY', ctrlKey: true, shiftKey: true, bubbles: true };
    window.dispatchEvent(new KeyboardEvent('keydown', init));
    window.dispatchEvent(new KeyboardEvent('keydown', { ...init, repeat: true }));
    window.dispatchEvent(new KeyboardEvent('keyup', init));
  });
  await expect.poll(() => runner.captures.length).toBe(1);
  await runner.page.context().close();
  await runner.waitForBrowserClose();
  const files = await readdir(runner.runDir);
  expect(files.filter((file) => file.endsWith('.html'))).toEqual(['Snapshot Conformance SPA.html']);
  const report = await validateHtml(runner.runDir);
  expect(report.passed).toBe(true);
});
