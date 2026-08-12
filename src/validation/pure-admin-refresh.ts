import { SnapshotRunner } from '../runner.js';

const baseURL = process.env.PURE_ADMIN_URL ?? 'http://127.0.0.1:4178';
const outputRoot = process.env.BASELINE_OUTPUT ?? 'baseline/pages';

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
      id: 'pure-admin-v7-refresh',
      version: '3',
      startUrl: `${baseURL}/#/login`,
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
    await page.goto(`${baseURL}/#/system/user/index`);
    await page.getByRole('button', { name: /新增用户/ }).waitFor();
    const queryInput = page.locator('.el-form input').first();
    await queryInput.fill('小铭');
    const queryButton = page.getByRole('button', { name: /^搜索$|^查询$/ }).first();
    if (await queryButton.isVisible()) await queryButton.click();
    await runner.capture('用户管理-查询列表');
    await runner.finish();
    console.log(JSON.stringify({ captures: runner.captures.length, file: runner.captures[0]?.filePath }, null, 2));
  } catch (error) {
    await runner.closeAsFailed(error);
    throw error;
  }
}

await main();
