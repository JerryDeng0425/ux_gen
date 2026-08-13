import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [['list'], ['json', { outputFile: 'test-results/results.json' }]],
  use: {
    browserName: 'chromium',
    channel: 'chrome',
    headless: true,
    viewport: { width: 1280, height: 800 },
    screenshot: 'off',
    video: 'off',
    trace: 'off'
  },
  outputDir: 'test-results/output'
});
