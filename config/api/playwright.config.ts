import { defineConfig } from '@playwright/test';
import path from 'node:path';
const root = process.cwd();
const runId = process.env.API_RUN_ID || new Date().toISOString().replace(/[:.]/g, '-');
const output = path.join(root, 'reports/api', runId);
export default defineConfig({
  testDir: path.join(root, 'tests/api/specs'),
  outputDir: path.join(output, 'evidence'),
  workers: 1, retries: 0, timeout: 45_000, forbidOnly: Boolean(process.env.CI),
  reporter: [
    ['list'],
    ['html', { outputFolder: path.join(output, 'html'), open: 'never' }],
    ['json', { outputFile: path.join(output, 'results.json') }],
    ['junit', { outputFile: path.join(output, 'junit.xml') }],
  ],
  use: {
    baseURL: process.env.BOOKER_BASE_URL ?? 'https://restful-booker.herokuapp.com',
    extraHTTPHeaders: { Accept: 'application/json', 'Content-Type': 'application/json' },
    actionTimeout: 25_000, trace: 'off',
  },
});
