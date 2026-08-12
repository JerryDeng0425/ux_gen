import { expect, test } from '@playwright/test';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const indexPath = process.env.PROTOTYPE_INDEX
  ?? path.join(process.env.TEMP ?? '.', 'ux-gen-prototype-validation-dist', 'index.html');
const indexURL = pathToFileURL(indexPath).href;
const pages = [
  { route: '/overview', root: 'page-overview', controls: ['.side-menu .el-menu-item', '.metric-card'] },
  { route: '/home', root: 'page-home', controls: ['.side-menu .el-menu-item', '.welcome-card button'] },
  { route: '/users', root: 'page-users', controls: ['[data-testid="search-users"]', '[data-testid="create-user"]'] },
  { route: '/user-exceptions', root: 'page-user-exceptions', controls: ['[data-testid="exception-status"]', '[data-testid="handle-exception"]'] },
  { route: '/form', root: 'page-form', controls: ['[data-testid="task-name"]', '[data-testid="submit-task"]'] },
  { route: '/application', root: 'page-application', controls: ['[data-testid="application-reason"]', '[data-testid="submit-application"]'] },
  { route: '/dialog-editor', root: 'page-dialog-editor', controls: ['[data-testid="dialog-content"]', '[data-testid="save-dialog"]'] },
  { route: '/account-settings', root: 'page-account-settings', controls: ['.el-tabs__item', '.el-input__inner'] }
];

test('all routes have zero runtime failures and satisfy desktop layout gates', async ({ context, page }) => {
  await context.setOffline(true);
  const runtimeErrors: string[] = [];
  const failedRequests: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') runtimeErrors.push(`console: ${message.text()}`); });
  page.on('pageerror', (error) => runtimeErrors.push(`pageerror: ${error.message}`));
  page.on('requestfailed', (request) => failedRequests.push(`${request.method()} ${request.url()} ${request.failure()?.errorText}`));

  for (const item of pages) {
    await page.goto(`${indexURL}#${item.route}`);
    const root = page.getByTestId(item.root);
    await expect(root).toBeVisible();
    const layout = await page.evaluate(() => ({
      viewport: { width: innerWidth, height: innerHeight },
      documentWidth: document.documentElement.scrollWidth,
      bodyWidth: document.body.scrollWidth
    }));
    expect(layout.viewport).toEqual({ width: 1440, height: 900 });
    expect(Math.max(layout.documentWidth, layout.bodyWidth) - layout.viewport.width).toBeLessThanOrEqual(1);
    const box = await root.boundingBox();
    expect(box?.width ?? 0).toBeGreaterThan(0);
    expect(box?.height ?? 0).toBeGreaterThan(0);

    for (const selector of item.controls) {
      const control = page.locator(selector).first();
      await expect(control).toBeVisible();
      if (await control.evaluate((node) => ['BUTTON', 'INPUT', 'TEXTAREA'].includes(node.tagName))) await expect(control).toBeEnabled();
      const hit = await control.evaluate((node) => {
        const rect = node.getBoundingClientRect();
        const target = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
        return Boolean(target && (target === node || node.contains(target) || target.contains(node)));
      });
      expect(hit, `center point must hit ${selector} on ${item.route}`).toBe(true);
    }

    await page.reload();
    await expect(page.getByTestId(item.root)).toBeVisible();
  }

  expect(runtimeErrors).toEqual([]);
  expect(failedRequests).toEqual([]);
});
