import { expect, test } from '@playwright/test';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const indexPath = process.env.PROTOTYPE_INDEX
  ?? path.join(process.env.TEMP ?? '.', 'ux-gen-prototype-all-pages-dist', 'index.html');

const pages = [
  { route: '/overview', testId: 'page-overview', menu: '运营总览', title: '运营总览' },
  { route: '/home', testId: 'page-home', menu: '工作台', title: '工作台' },
  { route: '/users', testId: 'page-users', menu: '用户管理', title: '用户管理' },
  { route: '/user-exceptions', testId: 'page-user-exceptions', menu: '异常用户', title: '异常用户' },
  { route: '/form', testId: 'page-form', menu: '表单示例', title: '表单示例' },
  { route: '/application', testId: 'page-application', menu: '业务申请', title: '业务申请' },
  { route: '/dialog-editor', testId: 'page-dialog-editor', menu: '弹窗编辑', title: '弹窗编辑' },
  { route: '/account-settings', testId: 'page-account-settings', menu: '账号设置', title: '账号设置' }
];

test('all prototype pages have direct Hash routes, refresh, active menu and breadcrumb', async ({ context, page }) => {
  await context.setOffline(true);
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  for (const item of pages) {
    await page.goto(`${pathToFileURL(indexPath).href}#${item.route}`);
    await expect(page.getByTestId(item.testId)).toBeVisible();
    await expect(page.locator('.el-menu-item.is-active')).toContainText(item.menu);
    await expect(page.locator('.breadcrumb')).toContainText(item.title);
    await page.reload();
    await expect(page.getByTestId(item.testId)).toBeVisible();
  }
  expect(errors).toEqual([]);
});

test('every page is reachable by its visible menu item', async ({ context, page }) => {
  await context.setOffline(true);
  await page.goto(`${pathToFileURL(indexPath).href}#/overview`);
  for (const item of pages) {
    await page.locator('.side-menu').getByText(item.menu, { exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`#${item.route.replace('/', '\\/')}$`));
    await expect(page.getByTestId(item.testId)).toBeVisible();
    if (item.route === '/dialog-editor') {
      await page.getByRole('dialog', { name: '基础用法' }).getByRole('button', { name: '取消' }).click();
    }
  }
});
