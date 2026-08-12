import { expect, test } from '@playwright/test';
import { captureFileName, safePageName } from '../../src/artifacts/naming.js';

test('preserves readable Unicode and removes Windows-unsafe syntax', () => {
  expect(safePageName('../用户管理：待审核 / 列表')).toBe('用户管理：待审核 - 列表');
  expect(safePageName('  订单  详情.html  ')).toBe('订单 详情');
});

test('handles empty, reserved, and long names', () => {
  expect(safePageName('')).toBe('untitled');
  expect(safePageName('CON')).toBe('_CON');
  expect(Array.from(safePageName('页'.repeat(150)))).toHaveLength(100);
});

test('uses explicit name first and title otherwise', () => {
  expect(captureFileName('自定义页面', '原标题')).toBe('自定义页面.html');
  expect(captureFileName(undefined, '用户管理')).toBe('用户管理.html');
  expect(captureFileName(' ', '')).toBe('untitled.html');
});
