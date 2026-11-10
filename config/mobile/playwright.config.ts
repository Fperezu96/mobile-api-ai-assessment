import { defineConfig } from '@playwright/test';
import path from 'node:path';

const runId = process.env.MOBILE_RUN_ID || new Date().toISOString().replace(/[:.]/g, '-');
const directory = path.resolve('reports/mobile', runId);
export default defineConfig({
  testDir: path.resolve('tests/mobile/specs'),
  timeout: 120000,
  expect: { timeout: 10000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  outputDir: path.join(directory, 'evidence'),
  reporter: [
    ['list'],
    ['html', { outputFolder: path.join(directory, 'html'), open: 'never' }],
    ['json', { outputFile: path.join(directory, 'results.json') }],
    ['junit', { outputFile: path.join(directory, 'junit.xml') }],
  ],
  // No se crea navegador: el fixture abre una sesión nativa WebDriver/Appium.
  use: { trace: 'off', screenshot: 'off', video: 'off' },
});
