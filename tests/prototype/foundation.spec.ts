import { expect, test } from '@playwright/test';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const indexPath = process.env.PROTOTYPE_INDEX
  ?? path.join(process.env.TEMP ?? '.', 'ux-gen-prototype-foundation-dist', 'index.html');

test('prototype foundation opens directly from file protocol with Hash Router', async ({ context, page }) => {
  await context.setOffline(true);
  const errors: string[] = [];
  const requests: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('request', (request) => {
    if (/^https?:/i.test(request.url())) requests.push(request.url());
  });
  const url = `${pathToFileURL(indexPath).href}#/foundation`;
  await page.goto(url);
  await expect(page.getByTestId('foundation-page')).toBeVisible();
  await expect(page.getByText('基线页面').first()).toBeVisible();
  await page.reload();
  await expect(page.getByTestId('foundation-page')).toBeVisible();
  expect(requests).toEqual([]);
  expect(errors).toEqual([]);
});
