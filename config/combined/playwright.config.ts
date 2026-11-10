import { defineConfig } from '@playwright/test';
import path from 'node:path';
import api from '../api/playwright.config.js';
import mobile from '../mobile/playwright.config.js';
import type { MobileOptions } from '../mobile/device-profile.js';

const runId = process.env.QUALITY_RUN_ID || new Date().toISOString().replace(/[:.]/g, '-');
const output = path.resolve('reports/combined', runId);
export default defineConfig<MobileOptions>({
  testDir: path.resolve('tests'),
  fullyParallel: false, workers: 1 + (mobile.projects?.length || 1),
  retries: 0, forbidOnly: Boolean(process.env.CI), timeout: 120000,
  outputDir: path.join(output, 'evidence'),
  reporter: [
    ['list'], ['html', {outputFolder: path.join(output, 'html'), open: 'never'}],
    ['json', {outputFile: path.join(output, 'results.json')}],
    ['junit', {outputFile: path.join(output, 'junit.xml')}],
  ],
  use: {trace: 'off', screenshot: 'off', video: 'off'},
  projects: [
    {name: 'api', testDir: api.testDir, workers: 1, timeout: 45000, use: api.use},
    ...(mobile.projects || []).map(project => ({...project, testDir: mobile.testDir, timeout: 120000})),
  ],
});
