import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { Ajv, type ErrorObject } from 'ajv/dist/ajv.js';
import type { ScenarioConfig } from '../types.js';
import { scenarioSchema } from './schema.js';

const ajv = new Ajv({ allErrors: true, strict: false });
ajv.addFormat('uri', {
  type: 'string',
  validate(value: string) {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  }
});
const validate = ajv.compile<ScenarioConfig>(scenarioSchema);

export class ScenarioValidationError extends Error {
  constructor(public readonly errors: ErrorObject[]) {
    super(`Invalid scenario: ${errors.map((error) => `${error.instancePath || '/'} ${error.message}`).join('; ')}`);
    this.name = 'ScenarioValidationError';
  }
}

export function validateScenario(value: unknown): ScenarioConfig {
  if (!validate(value)) {
    throw new ScenarioValidationError(validate.errors ?? []);
  }
  const scenario = value as ScenarioConfig;
  const ids = scenario.keypoints.map((keypoint) => keypoint.id);
  if (new Set(ids).size !== ids.length) {
    throw new Error('Invalid scenario: keypoint ids must be unique');
  }
  return {
    ...scenario,
    captureMode: scenario.captureMode ?? 'exact',
    hotkey: scenario.hotkey ?? 'Ctrl+Shift+Y'
  };
}

export async function loadScenario(filePath: string): Promise<ScenarioConfig> {
  const absolutePath = path.resolve(filePath);
  const raw = await readFile(absolutePath, 'utf8');
  return validateScenario(JSON.parse(raw) as unknown);
}
