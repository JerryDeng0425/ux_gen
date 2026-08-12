import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/prototype',
  timeout: 45_000,
  expect: { timeout: 7_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [['list'], ['json', { outputFile: process.env.PROTOTYPE_REPORT ?? 'test-results/prototype-results.json' }]],
  use: {
    browserName: 'chromium',
    headless: true,
    viewport: { width: 1440, height: 900 },
    screenshot: 'off',
    video: 'off',
    trace: 'off'
  },
  outputDir: process.env.PROTOTYPE_TEST_OUTPUT ?? 'test-results/prototype-output',
  projects: [
    { name: 'chrome', use: { channel: 'chrome' } },
    { name: 'edge', use: { channel: 'msedge' } }
  ]
});
