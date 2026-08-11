import { expect, test } from '@playwright/test';
import { safeSlug } from '../../src/artifacts/naming.js';

test('normalizes unsafe artifact names', () => {
  expect(safeSlug('../K01: Dashboard / 首页')).toBe('k01-dashboard');
  expect(safeSlug('')).toBe('snapshot');
});
