import { SnapshotRunner } from '../runner.js';

const baseURL = process.env.PURE_ADMIN_URL ?? 'http://127.0.0.1:4178';
const outputRoot = process.env.BASELINE_OUTPUT ?? 'baseline/pages';

async function waitForCapture(runner: SnapshotRunner, previousCount: number): Promise<void> {
  const deadline = Date.now() + 10_000;
  while (runner.captures.length <= previousCount && Date.now() < deadline) await runner.page.waitForTimeout(100);
  if (runner.captures.length <= previousCount) throw new Error('Timed out waiting for browser-triggered capture');
}

async function login(runner: SnapshotRunner): Promise<void> {
  const page = runner.page;
  await page.evaluate(() => {
    const original = CanvasRenderingContext2D.prototype.fillText;
    const digits: string[] = [];
    CanvasRenderingContext2D.prototype.fillText = function (text, x, y, maxWidth) {
      if (/^\d$/.test(String(text))) {
        digits.push(String(text));
        if (digits.length >= 4) document.documentElement.dataset.benchmarkCaptcha = digits.slice(-4).join('');
      }
      return maxWidth === undefined
        ? original.call(this, text, x, y)
        : original.call(this, text, x, y, maxWidth);
    };
    document.querySelector('canvas')?.click();
  });
  await page.waitForFunction(() => /^\d{4}$/.test(document.documentElement.dataset.benchmarkCaptcha ?? ''));
  const captcha = await page.locator('html').getAttribute('data-benchmark-captcha');
  await page.getByPlaceholder('验证码').fill(captcha!);
  await page.getByRole('button', { name: /^(登录|Login)$/ }).click();
  await page.waitForURL(/#\/welcome/);
}

async function main(): Promise<void> {
  const runner = new SnapshotRunner({
    scenario: {
      id: 'pure-admin-v7-baseline',
      version: '3',
      startUrl: `${baseURL}/#/login`,
      hotkey: 'Ctrl+Shift+Y',
      captureMode: 'exact',
      captureButton: true
    },
    outputRoot,
    headless: true
  });

  try {
    await runner.start();
    await login(runner);
    const page = runner.page;

    await page.goto(`${baseURL}/#/welcome`);
    await page.locator('body').waitFor();
    await runner.capture('运营总览');

    const beforeButton = runner.captures.length;
    await page.evaluate(() => {
      const host = document.querySelector('#spa-snapshot-capture-host');
      const button = host?.shadowRoot?.querySelector('button') as HTMLButtonElement | null;
      button?.click();
    });
    await waitForCapture(runner, beforeButton);

    await page.goto(`${baseURL}/#/system/user/index`);
    await page.getByRole('button', { name: /新增用户/ }).waitFor();
    const queryInput = page.locator('.el-form input').first();
    if (await queryInput.isVisible()) await queryInput.fill('小铭');
    const queryButton = page.getByRole('button', { name: /^搜索$|^查询$/ }).first();
    if (await queryButton.isVisible()) await queryButton.click();
    await runner.capture('用户管理-查询列表');

    await page.goto(`${baseURL}/#/form/index`);
    await page.locator('form, .el-form').first().waitFor();
    const beforeHotkey = runner.captures.length;
    await page.keyboard.press('Control+Shift+Y');
    await waitForCapture(runner, beforeHotkey);
    await runner.capture('业务申请表单');

    await page.goto(`${baseURL}/#/components/dialog`);
    await page.getByRole('button', { name: '基础用法', exact: true }).click();
    await page.getByText('弹框内容-基础用法').waitFor();
    await runner.capture('基础编辑弹窗');

    await page.goto(`${baseURL}/#/account-settings`);
    await page.getByText(/个人信息|安全日志/).first().waitFor();
    await runner.capture('账号设置');

    await page.goto(`${baseURL}/#/system/user/index`);
    await page.getByRole('button', { name: /新增用户/ }).waitFor();
    const latestQueryInput = page.locator('.el-form input').first();
    if (await latestQueryInput.isVisible()) await latestQueryInput.fill('小林');
    await runner.capture('用户管理-查询列表');

    await runner.finish();
    console.log(JSON.stringify({
      captures: runner.captures.length,
      files: [...new Set(runner.captures.map((capture) => capture.fileName))].sort(),
      outputRoot: runner.runDir
    }, null, 2));
  } catch (error) {
    await runner.closeAsFailed(error);
    throw error;
  }
}

await main();
