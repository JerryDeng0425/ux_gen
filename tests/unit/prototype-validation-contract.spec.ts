import { expect, test } from '@playwright/test';
import { Ajv2020 } from 'ajv/dist/2020.js';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const schema = JSON.parse(readFileSync(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../validation/contracts/prototype-validation.schema.json'), 'utf8'));

const valid = {
  schemaVersion: 3,
  status: 'PASS',
  environment: { os: 'Windows', node: 'v24.18.0', gitHead: 'working-tree' },
  commands: ['typecheck', 'build', 'chrome', 'edge'],
  browsers: { chrome: 'PASS', edge: 'PASS' },
  routes: Array.from({ length: 8 }, (_, index) => ({ route: `/r${index}`, status: 'PASS' })),
  interactions: ['users', 'forms', 'dialog-settings'],
  baselineHashes: Object.fromEntries(Array.from({ length: 7 }, (_, index) => [`p${index}.html`, 'sha256'])),
  artifacts: { dist: 'sha256' }
};

test('validation contract accepts complete evidence and rejects missing mandatory sections', () => {
  const validate = new Ajv2020({ allErrors: true }).compile(schema);
  expect(validate(valid)).toBe(true);
  for (const key of ['routes', 'interactions', 'browsers'] as const) {
    const broken = { ...valid };
    delete broken[key];
    expect(validate(broken), `missing ${key} must fail`).toBe(false);
  }
  expect(validate({ ...valid, browsers: { chrome: 'PASS' } }), 'missing Edge must fail').toBe(false);
});
