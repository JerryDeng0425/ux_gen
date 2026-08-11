import { expect, test } from '@playwright/test';
import { createServer, type ViteDevServer } from 'vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { captureFromPage, captureRuntimeScript } from '../../src/capture/runtime.js';

const fixtureRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../fixtures/conformance-spa');
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

test.beforeEach(async ({ page }) => {
  await page.addInitScript({ content: captureRuntimeScript({ hotkey: 'Ctrl+Shift+Y', captureMode: 'exact', redactSelectors: [] }) });
  await page.goto(`${baseUrl}?token=fixture-secret#/users`);
  await expect(page.getByTestId('users')).toBeVisible();
});

test('freezes runtime state, removes scripts, and redacts secrets', async ({ page }) => {
  await page.locator('#name').fill('Ada Lovelace');
  await page.locator('#notes').fill('runtime notes');
  await page.locator('#enabled').check();
  await page.locator('#choice').selectOption('beta');
  await page.locator('#editable').fill('edited content');
  await page.locator('#details').evaluate((element: HTMLDetailsElement) => { element.open = true; });
  await page.locator('#open-dialog').click();
  await page.locator('#dialog-value').fill('unsaved draft');
  await page.locator('#scroll-box').evaluate((element) => { element.scrollTop = 40; element.scrollLeft = 30; });

  const payload = await captureFromPage(page, 'K03', 'exact', []);
  expect(payload.oversized).toBe(false);
  expect(payload.html).toContain('value="Ada Lovelace"');
  expect(payload.html).toContain('runtime notes');
  expect(payload.html).toContain('value="beta" selected');
  expect(payload.html).toContain('id="edit-dialog" open');
  expect(payload.html).toContain('unsaved draft');
  expect(payload.html).not.toContain('fixture-secret');
  expect(payload.html).not.toContain('<script');
  expect(payload.sanitizedUrl).toContain('%5BREDACTED%5D');
  expect(payload.route).toContain('#/users');
  expect(payload.scrollPositions.some((position) => position.top === 40 && position.left === 30)).toBe(true);
  expect(payload.warnings.some((warning) => warning.code === 'canvas_unreadable')).toBe(false);
  expect(payload.warnings.some((warning) => warning.code === 'iframe_present')).toBe(true);
  expect(payload.warnings.some((warning) => warning.code === 'shadow_dom_present')).toBe(true);

  const replay = await page.context().newPage();
  await replay.setContent(payload.html);
  await expect(replay.locator('#name')).toHaveValue('Ada Lovelace');
  await expect(replay.locator('#enabled')).toBeChecked();
  await expect(replay.locator('#choice')).toHaveValue('beta');
  await expect(replay.locator('#edit-dialog')).toHaveAttribute('open', '');
  await expect(replay.locator('script')).toHaveCount(0);
  await replay.close();
});

test('serializes readable canvas and warns for the unreadable canvas', async ({ page }) => {
  await page.goto(`${baseUrl}#/dashboard`);
  const payload = await captureFromPage(page, 'K01', 'exact', []);
  expect(payload.html).toContain('data-snapshot-canvas="true"');
  expect(payload.warnings.some((warning) => warning.code === 'canvas_unreadable')).toBe(true);
  expect(payload.specialContent.canvasTotal).toBe(2);
  expect(payload.specialContent.canvasSerialized).toBe(1);
  expect(payload.specialContent.canvasFailed).toBe(1);
});

test('applies configured selector redaction', async ({ page }) => {
  const payload = await captureFromPage(page, 'K02', 'exact', ['#editable']);
  expect(payload.html).toContain('data-snapshot-redacted="selector"');
  expect(payload.html).not.toContain('editable initial');
});

test('submits a frozen payload through the page hotkey binding', async ({ page }) => {
  let received: unknown;
  await page.exposeBinding('__spaSnapshotSubmit', (_source, payload) => { received = payload; });
  await page.keyboard.press('Control+Shift+Y');
  await expect.poll(() => received).not.toBeUndefined();
  expect(received).toMatchObject({ oversized: false, route: expect.stringContaining('#/users') });
});
