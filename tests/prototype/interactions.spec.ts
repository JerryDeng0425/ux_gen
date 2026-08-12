import { expect, test } from '@playwright/test';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const indexPath = process.env.PROTOTYPE_INDEX
  ?? path.join(process.env.TEMP ?? '.', 'ux-gen-prototype-interactions-dist', 'index.html');
const indexURL = pathToFileURL(indexPath).href;

test.beforeEach(async ({ context }) => context.setOffline(true));

test('users support filter, pagination, validation, create, edit, status and delete with refresh reset', async ({ page }) => {
  await page.goto(`${indexURL}#/users`);
  await expect(page.getByTestId('users-table').locator('tbody tr')).toHaveCount(1);
  await page.getByTestId('reset-users').click();
  await expect(page.getByTestId('users-table').locator('tbody tr')).toHaveCount(4);
  await page.getByTestId('priority-filter').click();
  await page.getByRole('option', { name: '高', exact: true }).click();
  await page.getByTestId('search-users').click();
  await expect(page.getByTestId('users-table')).toContainText('高');
  await expect(page.getByTestId('users-table').locator('tbody tr')).toHaveCount(2);
  await page.getByTestId('reset-users').click();
  await page.getByTestId('create-user').click();
  await page.getByTestId('save-user').click();
  await expect(page.getByText('请输入用户名称')).toBeVisible();
  await page.getByTestId('user-name').fill('孟浩然');
  await page.getByTestId('user-account').fill('menghaoran');
  await page.getByTestId('user-phone').fill('13300133000');
  await page.getByTestId('save-user').click();
  await expect(page.getByText('用户新增成功')).toBeVisible();
  await page.getByTestId('user-keyword').fill('孟浩然');
  await page.getByTestId('search-users').click();
  await expect(page.getByTestId('users-table')).toContainText('孟浩然');
  await page.getByRole('button', { name: '修改' }).click();
  await page.getByTestId('user-name').fill('孟浩然（修改）');
  await page.getByTestId('save-user').click();
  await expect(page.getByText('用户修改成功')).toBeVisible();
  await page.locator('.el-switch').first().click();
  await expect(page.getByText(/已停用/)).toBeVisible();
  await page.getByTestId('users-table').locator('tbody tr').first().getByRole('button', { name: '删除' }).click();
  await page.getByRole('tooltip').getByRole('button', { name: '确定' }).click();
  await expect(page.getByText('用户删除成功')).toBeVisible();
  await page.reload();
  await expect(page.getByTestId('user-keyword')).toHaveValue('小铭');
  await expect(page.getByTestId('users-table')).toContainText('小铭');
});

test('exception users can be filtered and moved into processing', async ({ page }) => {
  await page.goto(`${indexURL}#/user-exceptions`);
  await expect(page.getByTestId('exceptions-table').locator('tbody tr')).toHaveCount(3);
  await page.getByTestId('exception-status').click();
  await page.getByRole('option', { name: '待处理', exact: true }).click();
  await expect(page.getByTestId('exceptions-table').locator('tbody tr')).toHaveCount(1);
  await page.getByTestId('handle-exception').click();
  await expect(page.getByText('EX-20260813-01 已进入处理')).toBeVisible();
  await expect(page.getByTestId('exceptions-table').locator('tbody tr')).toHaveCount(0);
  await page.reload();
  await expect(page.getByTestId('exceptions-table').locator('tbody tr')).toHaveCount(3);
});

test('forms validate and provide success feedback', async ({ page }) => {
  await page.goto(`${indexURL}#/form`);
  await page.getByTestId('task-name').fill('');
  await page.getByTestId('submit-task').click();
  await expect(page.getByText('请输入任务名称')).toBeVisible();
  await page.getByTestId('task-name').fill('版本发布');
  await page.getByTestId('submit-task').click();
  await expect(page.getByText('表单提交成功')).toBeVisible();

  await page.goto(`${indexURL}#/application`);
  await page.getByTestId('application-reason').fill('');
  await page.getByTestId('submit-application').click();
  await expect(page.getByText('请输入申请说明')).toBeVisible();
  await page.getByTestId('application-reason').fill('开发多租户管理');
  await page.getByTestId('submit-application').click();
  await expect(page.getByText('业务申请提交成功')).toBeVisible();
});

test('dialog editing and account tabs are interactive', async ({ page }) => {
  await page.goto(`${indexURL}#/dialog-editor`);
  await expect(page.getByTestId('basic-dialog')).toBeVisible();
  await page.getByTestId('dialog-content').fill('弹框内容-已修改');
  await page.getByTestId('save-dialog').click();
  await expect(page.getByText('弹框内容保存成功')).toBeVisible();

  await page.goto(`${indexURL}#/account-settings`);
  await page.getByRole('tab', { name: '安全日志' }).click();
  await expect(page.getByText('Windows')).toBeVisible();
  await page.getByRole('tab', { name: '系统配置' }).click();
  await page.getByText('深色', { exact: true }).click();
  await expect(page.getByRole('radio', { name: '深色' })).toBeChecked();
});
