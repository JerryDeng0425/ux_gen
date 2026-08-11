#!/usr/bin/env node
import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import path from 'node:path';
import { SnapshotRunner } from './runner.js';
import { loadScenario, ScenarioValidationError } from './scenarios/loader.js';
import { validateRun } from './validation/validator.js';

const EXIT = { success: 0, config: 2, runtime: 3, incomplete: 4, validation: 5 } as const;

function usage(): string {
  return `SPA Keypoint Snapshot

Usage:
  spa-snapshot run --scenario <file> [--output <dir>] [--headless]
  spa-snapshot validate --run-dir <dir> [--visual]

Interactive commands:
  capture [Kxx]   Capture the current or specified keypoint
  status          Show URL and keypoint states
  skip Kxx reason Skip a keypoint with a recorded reason
  finish          Save the summary and end the session
  quit            Confirm before ending an incomplete session`;
}

function option(args: string[], name: string): string | undefined {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
}

async function runInteractive(args: string[]): Promise<number> {
  const scenarioPath = option(args, '--scenario');
  if (!scenarioPath) {
    console.error('Missing --scenario <file>');
    return EXIT.config;
  }
  const scenario = await loadScenario(scenarioPath);
  const outputRoot = path.resolve(option(args, '--output') ?? scenario.outputDir ?? 'artifacts');
  const runner = new SnapshotRunner({ scenario, outputRoot, headless: args.includes('--headless') });
  const terminal = createInterface({ input, output });
  try {
    await runner.start();
    while (true) {
      const line = (await terminal.question('snapshot> ')).trim();
      const [command = '', ...rest] = line.split(/\s+/);
      try {
        if (command === 'capture') await runner.capture(rest[0]);
        else if (command === 'status') runner.printStatus();
        else if (command === 'skip') {
          if (!rest[0]) throw new Error('Usage: skip <keypoint-id> <reason>');
          await runner.skip(rest[0], rest.slice(1).join(' '));
        } else if (command === 'finish') return (await runner.finish()) ? EXIT.success : EXIT.incomplete;
        else if (command === 'quit') {
          const confirmation = (await terminal.question('Unfinished work may remain. Type yes to quit: ')).trim().toLowerCase();
          if (confirmation === 'yes') {
            await runner.finish();
            return EXIT.incomplete;
          }
        } else if (command === 'help' || command === '?') console.log(usage());
        else if (command) console.error(`Unknown command: ${command}. Type help.`);
      } catch (error) {
        console.error(error instanceof Error ? error.message : String(error));
      }
    }
  } catch (error) {
    await runner.closeAsFailed(error);
    throw error;
  } finally {
    terminal.close();
  }
}

async function main(): Promise<number> {
  const args = process.argv.slice(2);
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(usage());
    return EXIT.success;
  }
  if (args[0] === 'run') return runInteractive(args.slice(1));
  if (args[0] === 'validate') {
    const runDir = option(args, '--run-dir');
    if (!runDir) {
      console.error('Missing --run-dir <dir>');
      return EXIT.config;
    }
    const report = await validateRun(runDir, { visual: args.includes('--visual') });
    console.log(JSON.stringify(report, null, 2));
    return report.passed ? EXIT.success : EXIT.validation;
  }
  console.error(`Unknown command: ${args[0]}\n${usage()}`);
  return EXIT.config;
}

main().then((code) => {
  process.exitCode = code;
}).catch((error) => {
  if (error instanceof ScenarioValidationError || error instanceof SyntaxError) {
    console.error(error.message);
    process.exitCode = EXIT.config;
  } else {
    console.error(error instanceof Error ? error.stack ?? error.message : String(error));
    process.exitCode = EXIT.runtime;
  }
});
