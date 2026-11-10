import { defineConfig } from '@playwright/test';
import path from 'node:path';
const root = process.cwd();
export default defineConfig({
  testDir: path.join(root, 'tests/api/specs'),
  outputDir: path.join(root, 'reports/api/results'),
  workers: 1, retries: 0, timeout: 45_000, forbidOnly: Boolean(process.env.CI),
  reporter: [
    ['list'],
    ['html', { outputFolder: path.join(root, 'reports/api/html'), open: 'never' }],
    ['json', { outputFile: path.join(root, 'reports/api/results.json') }],
    ['junit', { outputFile: path.join(root, 'reports/api/junit.xml') }],
  ],
  use: {
    baseURL: process.env.BOOKER_BASE_URL ?? 'https://restful-booker.herokuapp.com',
    extraHTTPHeaders: { Accept: 'application/json', 'Content-Type': 'application/json' },
    actionTimeout: 25_000, trace: 'retain-on-failure',
  },
});
