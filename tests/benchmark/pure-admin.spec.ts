import { expect, test } from '@playwright/test';

const baseURL = process.env.PURE_ADMIN_URL ?? 'http://127.0.0.1:4178';

test('Pure Admin v7 benchmark exposes mock login and five representative page families', async ({ page }) => {
  const externalBusinessRequests: string[] = [];
  const runtimeErrors: string[] = [];

  page.on('request', (request) => {
    const url = new URL(request.url());
    if (!['127.0.0.1', 'localhost'].includes(url.hostname) && request.resourceType() === 'xhr') {
      externalBusinessRequests.push(request.url());
    }
  });
  page.on('pageerror', (error) => runtimeErrors.push(error.message));

  await page.goto(`${baseURL}/#/login`);
  await expect(page.locator('form')).toBeVisible();

  // The visual captcha is generated locally. Read the current value from the Vue-bound
  // input/store by assigning the store value through the component's exposed DOM state.
  // For the benchmark smoke test only, the validation callback is exercised with the
  // generated value discovered from the app's Pinia store.
  const verificationCode = await page.evaluate(() => {
    const pinia = (window as unknown as { __pinia?: { state: { value: Record<string, { verifyCode?: string }> } } }).__pinia;
    return pinia?.state.value.user?.verifyCode ?? '';
  });

  // Pure Admin does not expose Pinia on window; obtain the code by intercepting canvas
  // drawText calls on a fresh captcha render if needed.
  if (!verificationCode) {
    await page.reload();
    const code = await page.evaluate(() => {
    const input = Array.from(document.querySelectorAll('input')).find((node) =>
        (node.getAttribute('placeholder') ?? '').includes('验证码')
      );
      return input?.getAttribute('data-benchmark-code') ?? '';
    });
    if (code) await page.getByPlaceholder('验证码').fill(code);
  } else {
    await page.getByPlaceholder('验证码').fill(verificationCode);
  }

  // Validate the mock endpoints directly in the browser origin, then seed the exact
  // authentication result through the same local storage used by the application.
  const loginResult = await page.evaluate(async () => {
    const response = await fetch('/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin123' })
    });
    return response.json();
  });
  expect(loginResult.code).toBe(0);
  expect(loginResult.data.roles).toContain('admin');

  // Complete the real UI login by supplying the generated captcha via the Vue input's
  // private model. Canvas text can be decoded deterministically by replaying after an
  // init hook, so install it and reload once.
  await page.addInitScript(() => {
    const original = CanvasRenderingContext2D.prototype.fillText;
    const digits: string[] = [];
    CanvasRenderingContext2D.prototype.fillText = function (text, x, y, maxWidth) {
      if (/^\d$/.test(String(text))) {
        digits.push(String(text));
        if (digits.length === 4) document.documentElement.dataset.benchmarkCaptcha = digits.join('');
      }
      return maxWidth === undefined
        ? original.call(this, text, x, y)
        : original.call(this, text, x, y, maxWidth);
    };
  });
  await page.reload();
  await expect.poll(() => page.locator('html').getAttribute('data-benchmark-captcha')).toMatch(/^\d{4}$/);
  const captcha = await page.locator('html').getAttribute('data-benchmark-captcha');
  await page.getByPlaceholder('验证码').fill(captcha!);
  await page.getByRole('button', { name: /^(登录|Login)$/ }).click();
  await expect(page).toHaveURL(/#\/welcome/);

  const pages = [
    { family: 'dashboard', path: '/welcome', locator: '.main-content, main, .app-main' },
    { family: 'query-table', path: '/system/user/index', role: 'button', name: /新增用户/ },
    { family: 'form-detail', path: '/form/index', locator: 'form, .el-form' },
    { family: 'dialog', path: '/components/dialog', role: 'button', name: /^基础用法$/ },
    { family: 'settings-theme', path: '/account-settings', text: /个人信息|安全日志/ }
  ];

  for (const item of pages) {
    await page.goto(`${baseURL}/#${item.path}`);
    await expect(page.locator('body')).not.toBeEmpty();
    if (item.locator) await expect(page.locator(item.locator).first()).toBeVisible();
    if (item.role === 'button') await expect(page.getByRole('button', { name: item.name }).first()).toBeVisible();
    if (item.text) await expect(page.getByText(item.text).first()).toBeVisible();
  }

  await page.goto(`${baseURL}/#/components/dialog`);
  await page.getByRole('button', { name: '基础用法', exact: true }).click();
  await expect(page.getByText('弹框内容-基础用法')).toBeVisible();

  expect(externalBusinessRequests).toEqual([]);
  expect(runtimeErrors).toEqual([]);
});
