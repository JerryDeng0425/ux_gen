#!/usr/bin/env node
import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import path from 'node:path';
import { SnapshotRunner } from './runner.js';
import type { ScenarioConfig } from './types.js';
import { validateHtml } from './validation/validator.js';

const EXIT = { success: 0, config: 2, runtime: 3, validation: 5 } as const;

function usage(): string {
  return `SPA Rendered DOM Snapshot

Usage:
  spa-snapshot run --url <http-or-https-url> [--output <dir>] [--headless]
  spa-snapshot validate --path <html-or-directory>

Capture at any time and as many times as you want. No keypoint order is enforced.

Interactive commands:
  capture [label]  Save the currently rendered DOM as one HTML file
  status           Show URL, capture count, and latest HTML path
  finish           End the session
  quit             End the session
  help             Show this help`;
}

function option(args: string[], name: string): string | undefined {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
}

async function runInteractive(args: string[]): Promise<number> {
  const startUrl = option(args, '--url');
  if (!startUrl) {
    console.error('Missing --url <http-or-https-url>');
    return EXIT.config;
  }
  let parsed: URL;
  try { parsed = new URL(startUrl); } catch { console.error('Invalid --url'); return EXIT.config; }
  if (!['http:', 'https:'].includes(parsed.protocol)) { console.error('--url must use http or https'); return EXIT.config; }
  const scenario: ScenarioConfig = { id: 'ad-hoc', version: '3.0.0', startUrl: parsed.toString(), captureMode: 'exact', hotkey: 'Ctrl+Shift+Y', captureButton: true };
  const outputRoot = path.resolve(option(args, '--output') ?? 'baseline/pages');
  const runner = new SnapshotRunner({ scenario, outputRoot, headless: args.includes('--headless') });
  const terminal = createInterface({ input, output });
  try {
    await runner.start();
    while (true) {
      const response = await Promise.race([
        terminal.question('snapshot> ').then((line) => ({ kind: 'input' as const, line })),
        runner.waitForBrowserClose().then(() => ({ kind: 'closed' as const }))
      ]);
      if (response.kind === 'closed') return EXIT.success;
      const line = response.line.trim();
      const [command = '', ...rest] = line.split(/\s+/);
      try {
        if (command === 'capture') await runner.capture(rest.join(' ') || undefined);
        else if (command === 'status') runner.printStatus();
        else if (command === 'finish' || command === 'quit') {
          await runner.finish();
          return EXIT.success;
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
    const inputPath = option(args, '--path');
    if (!inputPath) {
      console.error('Missing --path <html-or-directory>');
      return EXIT.config;
    }
    const report = await validateHtml(inputPath);
    for (const result of report.results) {
      console.log(`${result.passed ? 'PASS' : 'FAIL'} ${result.file}`);
      for (const issue of result.issues) console.log(`  ${issue.severity.toUpperCase()} ${issue.code}: ${issue.message}`);
    }
    console.log(`${report.passed ? 'Validation passed' : 'Validation failed'}: ${report.results.length} HTML file(s)`);
    return report.passed ? EXIT.success : EXIT.validation;
  }
  console.error(`Unknown command: ${args[0]}\n${usage()}`);
  return EXIT.config;
}

main().then((code) => {
  process.exitCode = code;
}).catch((error) => {
  if (error instanceof SyntaxError) {
    console.error(error.message);
    process.exitCode = EXIT.config;
  } else {
    console.error(error instanceof Error ? error.stack ?? error.message : String(error));
    process.exitCode = EXIT.runtime;
  }
});
