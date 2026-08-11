import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { SnapshotRunner } from './runner.js';
import { loadScenario } from './scenarios/loader.js';
import { validateRun } from './validation/validator.js';
import { executeVuesticFlow } from './validation/vuestic-flow.js';

const iterations = Number.parseInt(process.env.VUESTIC_ITERATIONS ?? '1', 10);
if (!Number.isInteger(iterations) || iterations < 1 || iterations > 100) throw new Error('VUESTIC_ITERATIONS must be between 1 and 100');
const scenario = await loadScenario(path.resolve('scenarios/vuestic.json'));
const temporaryRoot = await mkdtemp(path.join(tmpdir(), 'vuestic-acceptance-'));
const reportPath = path.resolve('reports/vuestic-acceptance-report.json');
const results: Array<{ iteration: number; passed: boolean; durationMs: number; keypoints: Record<string, string>; error?: string }> = [];
let browserUserAgent = '';

try {
  await mkdir(path.dirname(reportPath), { recursive: true });
  for (let iteration = 1; iteration <= iterations; iteration += 1) {
    const started = performance.now();
    const runner = new SnapshotRunner({ scenario, outputRoot: temporaryRoot, headless: true, log: () => undefined });
    try {
      await runner.start();
      if (!browserUserAgent) browserUserAgent = await runner.page.evaluate(() => navigator.userAgent);
      await executeVuesticFlow(runner);
      const complete = await runner.finish();
      const validation = await validateRun(runner.runDir, { writeReport: false });
      results.push({
        iteration,
        passed: complete && validation.passed,
        durationMs: Math.round(performance.now() - started),
        keypoints: Object.fromEntries(runner.summary.keypoints.map((item) => [item.id, item.status]))
      });
    } catch (error) {
      await runner.closeAsFailed(error);
      results.push({
        iteration,
        passed: false,
        durationMs: Math.round(performance.now() - started),
        keypoints: Object.fromEntries(runner.summary.keypoints.map((item) => [item.id, item.status])),
        error: error instanceof Error ? error.message : String(error)
      });
    }
    const report = {
      schemaVersion: 1,
      generatedAt: new Date().toISOString(),
      scenarioId: scenario.id,
      scenarioVersion: scenario.version,
      environment: { node: process.version, browserUserAgent },
      requestedIterations: iterations,
      completedIterations: results.length,
      passedIterations: results.filter((item) => item.passed).length,
      passed: results.length === iterations && results.every((item) => item.passed),
      results
    };
    await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);
    console.log(`Vuestic acceptance ${iteration}/${iterations}: ${results.at(-1)?.passed ? 'PASS' : 'FAIL'}`);
  }
  if (!results.every((item) => item.passed)) process.exitCode = 1;
} finally {
  await rm(temporaryRoot, { recursive: true, force: true });
}
