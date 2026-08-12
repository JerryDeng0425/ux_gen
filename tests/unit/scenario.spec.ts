import { expect, test } from '@playwright/test';
import { validateScenario } from '../../src/scenarios/loader.js';

const validScenario = {
  id: 'fixture',
  version: '2.0.0',
  startUrl: 'http://127.0.0.1:4173/'
};

test('accepts a launch config without keypoints and applies defaults', () => {
  const scenario = validateScenario(validScenario);
  expect(scenario.captureMode).toBe('exact');
  expect(scenario.hotkey).toBe('Ctrl+Shift+Y');
  expect(scenario.captureButton).toBe(true);
});

for (const field of ['id', 'version', 'startUrl'] as const) {
  test(`rejects a launch config missing ${field}`, () => {
    const invalid = { ...validScenario } as Record<string, unknown>;
    delete invalid[field];
    expect(() => validateScenario(invalid)).toThrow(/Invalid scenario/);
  });
}

test('rejects legacy fixed keypoints instead of silently enforcing them', () => {
  expect(() => validateScenario({
    ...validScenario,
    keypoints: [{ id: 'K01', name: 'Blocked', instruction: 'Legacy gate' }]
  })).toThrow(/Invalid scenario/);
});
