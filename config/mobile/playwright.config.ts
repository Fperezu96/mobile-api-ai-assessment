import { defineConfig } from '@playwright/test';
import path from 'node:path';
import { selectedDeviceProfiles, type MobileOptions } from './device-profile.js';

const profiles = selectedDeviceProfiles();
const runId = process.env.MOBILE_RUN_ID || new Date().toISOString().replace(/[:.]/g, '-');
const directory = path.resolve('reports/mobile', runId);
export default defineConfig<MobileOptions>({
  testDir: path.resolve('tests/mobile/specs'),
  timeout: 120000,
  expect: { timeout: 10000 },
  fullyParallel: false,
  workers: profiles.length,
  retries: 0,
  outputDir: path.join(directory, 'evidence'),
  reporter: [
    ['list'],
    ['html', { outputFolder: path.join(directory, 'html'), open: 'never' }],
    ['json', { outputFile: path.join(directory, 'results.json') }],
    ['junit', { outputFile: path.join(directory, 'junit.xml') }],
  ],
  // Se paraleliza entre dispositivos, conservando un único worker por UDID.
  projects: profiles.map(deviceProfile => ({
    name: deviceProfile.name,
    workers: 1,
    use: { deviceProfile },
  })),
  use: { trace: 'off', screenshot: 'off', video: 'off' },
});
