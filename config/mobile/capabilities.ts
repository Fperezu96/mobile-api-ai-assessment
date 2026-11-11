import type { AndroidDeviceProfile } from './device-profile.js';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

export function androidCapabilities(device: AndroidDeviceProfile) {
  const manifest = JSON.parse(readFileSync(path.resolve('apps/android-manifest.json'), 'utf8')) as {filename: string; sha256: string};
  const app = path.resolve('apps/downloads', manifest.filename);
  if (createHash('sha256').update(readFileSync(app)).digest('hex') !== manifest.sha256) throw new Error('La APK no coincide con el manifiesto.');
  return {
    platformName: 'Android',
    'appium:automationName': 'UiAutomator2',
    'appium:udid': device.udid,
    'appium:deviceName': device.deviceName,
    'appium:systemPort': device.systemPort,
    'appium:mjpegServerPort': device.mjpegServerPort,
    'appium:app': app,
    'appium:appPackage': 'com.saucelabs.mydemoapp.android',
    'appium:appActivity': '.view.activities.SplashActivity',
    'appium:noReset': false,
    'appium:fullReset': false,
    'appium:autoGrantPermissions': true,
    'appium:newCommandTimeout': 120,
  };
}
