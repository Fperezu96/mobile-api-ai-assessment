import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { remote } from 'webdriverio';

const user = process.env.BROWSERSTACK_USERNAME;
const key = process.env.BROWSERSTACK_ACCESS_KEY;
if (!user || !key) { console.error('Faltan credenciales locales.'); process.exit(2); }
const auth = 'Basic ' + Buffer.from(user + ':' + key).toString('base64');
const base = 'https://api-cloud.browserstack.com/app-automate';
const runId = new Date().toISOString().replaceAll(':', '-');
const output = 'artifacts/browserstack/' + runId;
await mkdir(output, { recursive: true });
const manifest = JSON.parse(await readFile('apps/android-manifest.json', 'utf8'));
const bytes = await readFile('apps/downloads/' + manifest.filename);
if (createHash('sha256').update(bytes).digest('hex') !== manifest.sha256) throw new Error('SHA256 del APK no coincide');

let session;
const result = { runId, purpose: 'Comprobar conexión y apertura nativa; no es prueba del carrito', status: 'running', appVersion: manifest.version };
try {
  // Seleccionar un dispositivo realmente anunciado por App Automate.
  const deviceResponse = await fetch(base + '/devices.json', { headers: { Authorization: auth }, signal: AbortSignal.timeout(20000) });
  if (!deviceResponse.ok) throw new Error('Consulta de dispositivos: HTTP ' + deviceResponse.status);
  const devices = await deviceResponse.json();
  const android = devices.filter(d => String(d.os).toLowerCase() === 'android' && d.real_mobile !== false);
  const device = android.find(d => d.device === 'Google Pixel 7' && String(d.os_version) === '13.0') ?? android.find(d => String(d.os_version).startsWith('13')) ?? android[0];
  if (!device) throw new Error('La cuenta no anuncia dispositivos Android');
  result.device = { name: device.device, osVersion: device.os_version };
  // Subir únicamente el APK cuyo hash acabamos de comprobar.
  const form = new FormData();
  if (process.argv.includes('--public-url')) { form.append('url', manifest.url); result.uploadMethod = 'public-url'; } else { form.append('file', new Blob([bytes]), manifest.filename); result.uploadMethod = 'file'; }
  const upload = await fetch(base + '/upload', { method: 'POST', headers: { Authorization: auth }, body: form, signal: AbortSignal.timeout(120000) });
  if (!upload.ok) throw new Error('Carga de APK: HTTP ' + upload.status + ' ' + (await upload.text()).slice(0, 1000));
  const uploaded = await upload.json();
  if (!uploaded.app_url?.startsWith('bs://')) throw new Error('La carga no devolvió un identificador de app válido');
  result.appUrl = uploaded.app_url;
  session = await remote({
    hostname: 'hub-cloud.browserstack.com', port: 443, protocol: 'https', path: '/wd/hub',
    user, key, logLevel: 'silent', connectionRetryCount: 0, connectionRetryTimeout: 120000,
    capabilities: {
      platformName: 'Android',
      'appium:automationName': 'UiAutomator2',
      'appium:deviceName': device.device,
      'appium:platformVersion': String(device.os_version),
      'appium:app': uploaded.app_url,
      'bstack:options': { projectName: 'Mobile API AI Assessment', buildName: 'Conexion inicial ' + runId, sessionName: 'Abrir APK y comprobar catalogo' },
    },
  });
  result.sessionId = session.sessionId;
  result.sessionUrl = 'https://app-automate.browserstack.com/dashboard/v2/sessions/' + session.sessionId;
  const catalog = await session.$('id=com.saucelabs.mydemoapp.android:id/productRV');
  await catalog.waitForDisplayed({ timeout: 30000 });
  result.currentPackage = await session.getCurrentPackage();
  if (result.currentPackage !== 'com.saucelabs.mydemoapp.android') throw new Error('El paquete activo no es la app esperada');
  await session.saveScreenshot(output + '/catalogo-android.png');
  await writeFile(output + '/catalogo-android.xml', await session.getPageSource());
  result.status = 'passed';
  await session.execute('browserstack_executor: ' + JSON.stringify({ action: 'setSessionStatus', arguments: { status: 'passed', reason: 'APK instalado y catalogo nativo visible; comprobacion de conexion' } }));
} catch (error) {
  result.status = 'failed';
  result.error = String(error.message).replaceAll(key, '[OCULTO]').replaceAll(user, '[USUARIO]').replaceAll(auth, '[AUTORIZACION]');
  if (session) {
    try { await session.saveScreenshot(output + '/error.png'); } catch { /* Conservar el error original si no hay captura. */ }
  }
  process.exitCode = 1;
} finally {
  if (session) {
    try { await session.deleteSession(); } catch { result.sessionClose = 'No se pudo confirmar cierre'; process.exitCode = 1; }
  }
  await writeFile(output + '/result.json', JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result, null, 2));
}
