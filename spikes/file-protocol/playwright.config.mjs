import { defineConfig } from '@playwright/test';

const resultDirectory = process.env.FILE_PROTOCOL_RESULTS || './test-results/output';

export default defineConfig({
  testDir: './tests',
  outputDir: resultDirectory,
  workers: 1,
  reporter: 'list',
  use: {
    headless: true,
    viewport: { width: 1440, height: 900 },
    screenshot: 'off',
    video: 'off',
    trace: 'off'
  },
  projects: [
    { name: 'chrome', use: { channel: 'chrome' } },
    { name: 'edge', use: { channel: 'msedge' } }
  ]
});
