import { expect, test } from '@playwright/test';
import { validateScenario } from '../../src/scenarios/loader.js';

const validScenario = {
  id: 'fixture',
  version: '1.0.0',
  startUrl: 'http://127.0.0.1:4173/',
  keypoints: [{ id: 'K01', name: 'Ready', instruction: 'Wait for ready state' }]
};

test('accepts a valid scenario and applies defaults', () => {
  const scenario = validateScenario(validScenario);
  expect(scenario.captureMode).toBe('exact');
  expect(scenario.hotkey).toBe('Ctrl+Shift+Y');
});

for (const field of ['id', 'startUrl', 'keypoints'] as const) {
  test(`rejects a scenario missing ${field}`, () => {
    const invalid = { ...validScenario } as Record<string, unknown>;
    delete invalid[field];
    expect(() => validateScenario(invalid)).toThrow(/Invalid scenario/);
  });
}

test('rejects duplicate keypoint ids', () => {
  expect(() => validateScenario({ ...validScenario, keypoints: [...validScenario.keypoints, ...validScenario.keypoints] })).toThrow(/unique/);
});
