import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { test as base, expect } from '@playwright/test';
import { remote, type Browser } from 'webdriverio';
import { writeFile } from 'node:fs/promises';
import { androidCapabilities } from '../../../config/mobile/capabilities.js';
import { NativeUi } from '../../../src/mobile/support/native-ui.js';
import { CatalogScreen, HeaderScreen, ProductDetailScreen, CartScreen, LoginScreen } from '../../../src/mobile/screens/android/shop.screens.js';
import { ShoppingActions } from '../../../src/mobile/actions/shopping.actions.js';

type NativeApp = {
  driver: Browser;
  catalog: CatalogScreen;
  header: HeaderScreen;
  detail: ProductDetailScreen;
  cart: CartScreen;
  login: LoginScreen;
  shopping: ShoppingActions;
};
export const test = base.extend<{app: NativeApp}>({
  app: async ({}, use, info) => {
    const capabilities = androidCapabilities();
    const endpoint = 'http://127.0.0.1:' + (process.env.APPIUM_PORT || '4723');
    const statusResponse = await fetch(endpoint + '/status', {signal: AbortSignal.timeout(5000)});
    const status = await statusResponse.json();
    if (!statusResponse.ok || status.value?.ready !== true) throw new Error('El servidor Appium no está listo.');
    await info.attach('Servidor Appium', {body: JSON.stringify({endpoint, status: status.value}, null, 2), contentType: 'application/json'});
    // WebdriverIO es el cliente HTTP; el servidor Appium de appium:start controla Android mediante UiAutomator2.
    const driver = await remote({
      protocol: 'http', hostname: '127.0.0.1', port: Number(process.env.APPIUM_PORT || 4723), path: '/',
      logLevel: 'error', connectionRetryCount: 0, connectionRetryTimeout: 90000, capabilities,
    });
    const ui = new NativeUi(driver);
    const catalog = new CatalogScreen(ui);
    const detail = new ProductDetailScreen(ui);
    const header = new HeaderScreen(ui);
    const app: NativeApp = {driver, catalog, detail, header, cart: new CartScreen(ui), login: new LoginScreen(ui), shopping: new ShoppingActions(catalog, detail, header)};
    const captureErrors: string[] = [];
    try {
      await driver.setTimeout({implicit: 0});
      await driver.unlock();
      const initialTree = await driver.getPageSource();
      // La limpieza de la app no cierra un panel del sistema que quedó abierto.
      if (/com\.android\.systemui:id\/(notification_panel|notification_stack_scroller|qs_frame|quick_settings_panel)/.test(initialTree)) {
        await driver.back();
        await info.attach('Preparación del dispositivo', {body: 'Se cerró el panel de notificaciones antes del escenario.', contentType: 'text/plain'});
      }
      await driver.activateApp('com.saucelabs.mydemoapp.android');
      await info.attach('Sesión nativa', {body: JSON.stringify({sessionId: driver.sessionId, capabilities}, null, 2), contentType: 'application/json'});
      await catalog.waitForLoaded();
      await use(app);
    } finally {
      // Intentar ambas capturas aunque una falle; cerrar siempre la sesión.
      try {
        const screenshot = info.outputPath('pantalla-final.png');
        await driver.saveScreenshot(screenshot);
        await info.attach('Pantalla final', {path: screenshot, contentType: 'image/png'});
      } catch (error) { captureErrors.push('Captura: ' + String(error)); }
      try {
        const tree = info.outputPath('arbol-ui.xml');
        await writeFile(tree, await driver.getPageSource());
        await info.attach('Árbol UI nativo', {path: tree, contentType: 'application/xml'});
      } catch (error) { captureErrors.push('Árbol UI: ' + String(error)); }
      if (captureErrors.length) await info.attach('Errores de evidencia', {body: captureErrors.join('\n'), contentType: 'text/plain'});
      try {
        const sdk = process.env.ANDROID_HOME || 'C:/dev/.tools/android-sdk';
        const adb = path.join(sdk, 'platform-tools', process.platform === 'win32' ? 'adb.exe' : 'adb');
        const log = await promisify(execFile)(adb, ['-s', capabilities['appium:udid'], 'logcat', '-d', '-b', 'crash', '-t', '100'], {timeout: 5000, maxBuffer: 512000});
        await info.attach('Log de cierres Android (buffer del dispositivo)', {body: log.stdout, contentType: 'text/plain'});
      } catch (error) {
        await info.attach('Log Android no disponible', {body: String(error), contentType: 'text/plain'});
      }
      await driver.deleteSession();
      if (captureErrors.length) throw new Error('No se pudo conservar toda la evidencia nativa: ' + captureErrors.join('; '));
    }
  },
});
export { expect };
