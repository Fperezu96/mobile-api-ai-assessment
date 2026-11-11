import {renderPerformanceReport} from './performance-report.mjs';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
const execute = promisify(execFile);
const pkg = 'com.saucelabs.mydemoapp.android';
const udid = process.env.ANDROID_UDID || 'emulator-5554';
const sdk = process.env.ANDROID_HOME || 'C:/dev/.tools/android-sdk';
const adb = path.join(sdk, 'platform-tools', process.platform === 'win32' ? 'adb.exe' : 'adb');
const samples = Number(process.env.PERF_STARTUP_SAMPLES || 5);
if (!Number.isInteger(samples) || samples < 3 || samples > 20) throw new Error('PERF_STARTUP_SAMPLES debe estar entre 3 y 20.');
try {
  const response = await fetch('http://127.0.0.1:' + (process.env.APPIUM_PORT || 4723) + '/status', {signal: AbortSignal.timeout(1000)});
  if (response.ok) throw new Error('Cerrar el servidor/sesión Appium antes de medir este dispositivo.');
} catch (error) { if (String(error).includes('Cerrar el servidor')) throw error; }
const runId = new Date().toISOString().replace(/[:.]/g, '-');
const directory = path.resolve('reports/performance', runId);
fs.mkdirSync(directory, {recursive: true});
const report = {
  runId, startedAt: new Date().toISOString(), udid, package: pkg,
  methodology: 'Diagnóstico de laboratorio: APK debug en emulador; no Android Vitals de campo ni Web Vitals.',
  limitations: [
    'TotalTime de am start mide la primera actividad dibujada, no TTFD del catálogo.',
    'Force-stop produce proceso frío; no borra datos ni cachés del sistema.',
    'gfxinfo/CSV es diagnóstico local; no representa percentiles de usuarios reales.',
    'Los tiempos observados por ADB incluyen instrumentación y comunicación con el host.',
    'Un cierre no se interpreta como un frame lento ni como un ANR.'
  ],
  startup: [], phases: {}, host: {cpu: os.cpus()[0]?.model, memoryGiB: Math.round(os.totalmem() / 1024 ** 3)}
};
const save = (name, value) => fs.writeFileSync(path.join(directory, name), value);
async function command(args, options = {}) {
  const result = await execute(adb, ['-s', udid, ...args], {timeout: 30000, maxBuffer: 8 * 1024 * 1024, ...options});
  return result.stdout.trim();
}
const shell = (...args) => command(['shell', ...args]);
function tree(xml) {
  const all = [], stack = [];
  for (const token of xml.matchAll(/<(\/?)node\b([^>]*?)(\/?)>/g)) {
    if (token[1]) { stack.pop(); continue; }
    const attributes = Object.fromEntries([...token[2].matchAll(/([\w:-]+)="([^"]*)"/g)].map(m => [m[1], m[2]]));
    const node = {attributes, children: [], parent: stack.at(-1)};
    node.parent?.children.push(node); all.push(node);
    if (!token[3]) stack.push(node);
  }
  return all;
}
async function snapshot(name) {
  for (let attempt = 0; attempt < 5; attempt++) {
    // Un dump fallido puede dejar el archivo anterior: retirarlo antes de cada intento.
    await shell('rm', '-f', '/sdcard/assessment-perf-ui.xml');
    const result = await shell('uiautomator', 'dump', '/sdcard/assessment-perf-ui.xml');
    if (!result.includes('dumped to:')) continue;
    const xml = await shell('cat', '/sdcard/assessment-perf-ui.xml');
    if (!xml.includes('<hierarchy')) continue;
    save(name + '.xml', xml);
    return tree(xml);
  }
  throw new Error('No se obtuvo un árbol UI nuevo y estable: ' + name);
}
const byId = (nodes, id) => nodes.find(n => n.attributes['resource-id'] === pkg + ':id/' + id);
function bounds(node) {
  const values = node?.attributes.bounds?.match(/\d+/g)?.map(Number);
  if (!values || values.length !== 4 || values[2] <= values[0] || values[3] <= values[1]) throw new Error('Elemento sin límites utilizables.');
  return values;
}
async function tap(node) {
  const [left, top, right, bottom] = bounds(node);
  await shell('input', 'tap', String(Math.round((left + right) / 2)), String(Math.round((top + bottom) / 2)));
}
async function capture(name) {
  const result = await execute(adb, ['-s', udid, 'exec-out', 'screencap', '-p'], {encoding: 'buffer', maxBuffer: 8 * 1024 * 1024, timeout: 10000});
  save(name + '.png', result.stdout);
}
async function launch(name) {
  const result = await shell('am', 'start', '-W', '-S', '-n', pkg + '/.view.activities.SplashActivity');
  save(name + '-am-start.txt', result);
  if (!/Status:\s*ok/.test(result)) throw new Error('El arranque no terminó correctamente.');
  const nodes = await snapshot(name + '-catalog');
  if (!byId(nodes, 'productRV') || !nodes.some(n => n.attributes.text === 'Sauce Labs Backpack')) throw new Error('El catálogo no quedó disponible después del arranque.');
  return {totalTimeMs: Number(/TotalTime:\s*(\d+)/.exec(result)?.[1]), waitTimeMs: Number(/WaitTime:\s*(\d+)/.exec(result)?.[1]), launchState: /LaunchState:\s*(\w+)/.exec(result)?.[1], activity: /Activity:\s*(.+)/.exec(result)?.[1]};
}
const percentile = (values, fraction) => values.length ? [...values].sort((a,b) => a-b)[Math.max(0, Math.ceil(values.length * fraction) - 1)] : null;
function graphics(text) {
  const since = /Stats since:\s*(\d+)ns/.exec(text)?.[1];
  const durations = [];
  let headers;
  for (const line of text.split('\n')) {
    if (line.startsWith('Flags,')) { headers = line.trim().split(','); continue; }
    if (!headers || !/^\d+,/.test(line)) continue;
    const row = Object.fromEntries(line.trim().split(',').map((value, index) => [headers[index], value]));
    if (row.Flags !== '0' || !row.IntendedVsync || !row.FrameCompleted) continue;
    const start = BigInt(row.IntendedVsync), end = BigInt(row.FrameCompleted);
    if (end <= start || end >= 9223372036854775807n || (since && start < BigInt(since))) continue;
    durations.push(Number(end - start) / 1e6);
  }
  return {
    totalFramesReported: Number(/Total frames rendered:\s*(\d+)/.exec(text)?.[1]) || 0,
    jankyFramesReported: Number(/Janky frames:\s*(\d+)/.exec(text)?.[1]) || 0,
    frameSamples: durations.length, medianMs: percentile(durations, .5), p95Ms: percentile(durations, .95),
    maxMs: durations.length ? Math.max(...durations) : null,
    samplesOver16_67Ms: durations.filter(v => v > 1000 / 60).length,
    samplesOver700Ms: durations.filter(v => v > 700).length
  };
}
async function measureGraphics(name) {
  const raw = await shell('dumpsys', 'gfxinfo', pkg, 'framestats');
  save(name + '-gfxinfo.txt', raw);
  return graphics(raw);
}
try {
  if ((await command(['get-state'])) !== 'device') throw new Error('El dispositivo no está disponible.');
  report.device = {
    android: await shell('getprop', 'ro.build.version.release'), api: await shell('getprop', 'ro.build.version.sdk'),
    emulator: await shell('getprop', 'ro.kernel.qemu'), abi: await shell('getprop', 'ro.product.cpu.abi'),
    size: await shell('wm', 'size'), density: await shell('wm', 'density'), timezoneOffset: await shell('date', '+%z')
  };
  const packageInfo = await shell('dumpsys', 'package', pkg);
  save('package-info.txt', packageInfo);
  if (!report.device.size.includes('1080x1920')) throw new Error('Este protocolo de gestos está calibrado para QA_API33 a 1080x1920.');
  report.apk = {version: /versionName=(\S+)/.exec(packageInfo)?.[1], code: /versionCode=(\d+)/.exec(packageInfo)?.[1], debuggable: packageInfo.includes('DEBUGGABLE')};
  report.display = (await shell('dumpsys', 'display')).split('\n').filter(line => /fps=|refreshRate|mActiveModeId/.test(line)).slice(0,12);
  report.warmup = await launch('warmup');
  for (let index = 0; index < samples; index++) {
    const sample = await launch('startup-' + (index + 1));
    report.startup.push(sample);
    console.log('Arranque ' + (index + 1) + '/' + samples + ': ' + sample.totalTimeMs + ' ms, ' + sample.launchState);
  }
  await shell('dumpsys', 'gfxinfo', pkg, 'reset');
  // Los gestos son entradas controladas; no incluyen Appium ni esperas de aserciones.
  for (const direction of ['down', 'up']) for (let index = 0; index < 6; index++) {
    await shell('input', 'swipe', '540', direction === 'down' ? '1500' : '600', '540', direction === 'down' ? '600' : '1500', '300');
  }
  await snapshot('scroll-end');
  await capture('scroll-end');
  report.phases.catalogScroll = await measureGraphics('catalog-scroll');
  const memory = await shell('dumpsys', 'meminfo', pkg);
  save('catalog-meminfo.txt', memory);
  report.memoryTotalPssKiB = Number(/TOTAL PSS:\s*(\d+)/.exec(memory)?.[1] || /^\s*TOTAL\s+(\d+)/m.exec(memory)?.[1]) || null;
  await launch('remove-preparation');
  let nodes = await snapshot('remove-catalog');
  const title = nodes.find(n => n.attributes.text === 'Sauce Labs Backpack' && n.attributes['resource-id']?.endsWith(':id/titleTV'));
  await tap(title?.parent?.children.find(n => n.attributes['resource-id']?.endsWith(':id/productIV')));
  for (let attempt = 0; attempt < 6; attempt++) {
    nodes = await snapshot('detail-' + attempt);
    if (byId(nodes, 'cartBt')) break;
    await shell('input', 'swipe', '540', '1500', '540', '800', '300');
  }
  await tap(byId(nodes, 'cartBt'));
  nodes = await snapshot('added-product');
  if (!byId(nodes, 'cartTV')) throw new Error('La preparación no agregó el producto.');
  await tap(byId(nodes, 'cartRL'));
  nodes = await snapshot('cart-before-remove');
  if (!byId(nodes, 'cartCL') || !byId(nodes, 'removeBt')) throw new Error('No se preparó el carrito para medir eliminación.');
  await shell('dumpsys', 'gfxinfo', pkg, 'reset');
  const before = performance.now();
  await tap(byId(nodes, 'removeBt'));
  nodes = await snapshot('cart-after-remove');
  if (!byId(nodes, 'noItemTitleTV')) throw new Error('No se observó el estado vacío después de eliminar.');
  report.phases.remove = {adbObservedMs: performance.now() - before, emptyCartObserved: Boolean(byId(nodes, 'noItemTitleTV')), graphics: await measureGraphics('cart-remove')};
  await capture('cart-after-remove');
  await launch('crash-preparation');
  nodes = await snapshot('catalog-before-crash');
  const green = nodes.find(n => n.attributes.text === 'Sauce Labs Backpack (green)' && n.attributes['resource-id']?.endsWith(':id/titleTV'));
  const pid = await shell('pidof', pkg);
  const start = new Date().toISOString();
  const deviceEpochBefore = await shell('date', '+%s');
  await tap(green?.parent?.children.find(n => n.attributes['resource-id']?.endsWith(':id/productIV')));
  const after = await snapshot('after-crash');
  await capture('after-crash');
  const crashLog = await shell('logcat', '-d', '-b', 'crash', '-t', '300');
  save('crash-buffer.txt', crashLog);
  const currentPidLines = crashLog.split('\n').filter(line => new RegExp('\\s' + pid + '\\s').test(line));
  save('crash-current-pid.txt', currentPidLines.join('\n'));
  if (byId(after, 'productRV') || !currentPidLines.some(line => /NullPointerException/.test(line))) throw new Error('La fase de cierre no quedó corroborada por UI nueva y log del PID.');
  report.phases.crash = {startedAt: start, deviceEpochBefore, pid, catalogPresentAfter: Boolean(byId(after, 'productRV')), exceptions: currentPidLines.filter(line => /Exception|ProductCatalogFragment.java:/.test(line))};
  await launch('restored-catalog');
  console.log('Diagnóstico completado: ' + directory);
} catch (error) {
  report.error = String(error); process.exitCode = 1; console.error(report.error);
} finally {
  report.finishedAt = new Date().toISOString();
  report.startupSummary = {samples: report.startup.length, minMs: report.startup.length ? Math.min(...report.startup.map(s => s.totalTimeMs)) : null, medianMs: percentile(report.startup.map(s => s.totalTimeMs), .5), maxMs: report.startup.length ? Math.max(...report.startup.map(s => s.totalTimeMs)) : null};
  save('summary.json', JSON.stringify(report, null, 2));
  save('index.html', renderPerformanceReport(report));
  fs.writeFileSync('reports/performance/latest.json', JSON.stringify({runId, directory}, null, 2));
}
