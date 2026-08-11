import type { Page } from 'playwright';
import type { AssertionConfig } from '../types.js';

export async function checkPageAssertions(page: Page, assertions: AssertionConfig[]): Promise<string[]> {
  const failures: string[] = [];
  for (const assertion of assertions) {
    try {
      if (assertion.type === 'url') {
        if (!page.url().includes(assertion.includes)) failures.push(`URL does not include ${assertion.includes}`);
      } else if (assertion.type === 'exists') {
        if (await page.locator(assertion.selector).count() === 0) failures.push(`Missing selector ${assertion.selector}`);
      } else if (assertion.type === 'text') {
        const text = await page.locator(assertion.selector).first().textContent();
        if (!text?.includes(assertion.includes)) failures.push(`${assertion.selector} text does not include ${assertion.includes}`);
      } else if (assertion.type === 'attribute') {
        const value = await page.locator(assertion.selector).first().getAttribute(assertion.name);
        if (value !== assertion.equals) failures.push(`${assertion.selector}[${assertion.name}] expected ${assertion.equals}, got ${value}`);
      } else if (assertion.type === 'value') {
        const value = await page.locator(assertion.selector).first().inputValue();
        if (value !== assertion.equals) failures.push(`${assertion.selector} value expected ${assertion.equals}, got ${value}`);
      } else if (assertion.type === 'checked') {
        const value = await page.locator(assertion.selector).first().isChecked();
        if (value !== assertion.equals) failures.push(`${assertion.selector} checked expected ${assertion.equals}, got ${value}`);
      }
    } catch (error) {
      failures.push(`${assertion.type} assertion failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  return failures;
}
