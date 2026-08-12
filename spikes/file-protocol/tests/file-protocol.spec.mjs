import { cp, mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { expect, test } from '@playwright/test';

const root = process.cwd();
const buildOutput = process.env.FILE_PROTOCOL_OUTPUT || path.join(root, 'offline-dist');
let extracted = '';
let indexUrl = '';

test.beforeAll(async () => {
  extracted = await mkdtemp(path.join(tmpdir(), '离线 原型 '));
  await cp(buildOutput, extracted, { recursive: true });
  indexUrl = pathToFileURL(path.join(extracted, 'index.html')).href;
});

test.afterAll(async () => { await rm(extracted, { recursive: true, force: true }); });

test('built index is self-contained and file-protocol safe', async () => {
  const html = await readFile(path.join(buildOutput, 'index.html'), 'utf8');
  expect(html).not.toMatch(/(?:src|href)="\//);
  expect(html).not.toContain('modulepreload');
  expect(html).not.toMatch(/<script[^>]+src=/i);
  expect(html).not.toMatch(/<link[^>]+rel="stylesheet"/i);
});

for (const route of ['/dashboard', '/orders', '/settings']) {
  test(`opens and refreshes ${route} offline`, async ({ browser }) => {
    const context = await browser.newContext({ offline: true });
    const page = await context.newPage();
    const consoleErrors = [];
    const requests = [];
    page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });
    page.on('pageerror', error => consoleErrors.push(error.message));
    page.on('request', request => { if (/^https?:/i.test(request.url())) requests.push(request.url()); });
    await page.goto(`${indexUrl}#${route}`);
    await expect(page.locator(`[data-page="${route.slice(1)}"]`)).toBeVisible();
    await page.reload();
    await expect(page.locator(`[data-page="${route.slice(1)}"]`)).toBeVisible();
    expect(consoleErrors).toEqual([]);
    expect(requests).toEqual([]);
    await context.close();
  });
}
