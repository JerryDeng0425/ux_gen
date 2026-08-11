import { expect, test } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SnapshotRunner } from '../../src/runner.js';
import { loadScenario } from '../../src/scenarios/loader.js';
import { validateRun } from '../../src/validation/validator.js';
import { executeVuesticFlow } from '../../src/validation/vuestic-flow.js';

const enabled = process.env.RUN_VUESTIC_E2E === '1';
test.skip(!enabled, 'Set RUN_VUESTIC_E2E=1 to run the public-site acceptance flow');
test.setTimeout(120_000);

test('captures and validates Vuestic K01-K04 without human input', async ({}, testInfo) => {
  const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
  const scenario = await loadScenario(path.join(repositoryRoot, 'scenarios/vuestic.json'));
  const runner = new SnapshotRunner({ scenario, outputRoot: testInfo.outputPath('artifacts'), headless: true, log: console.log });
  await runner.start();
  try {
    await executeVuesticFlow(runner);
    expect(await runner.finish()).toBe(true);
    const report = await validateRun(runner.runDir);
    expect(report.passed).toBe(true);
  } catch (error) {
    await runner.closeAsFailed(error);
    throw error;
  }
});
