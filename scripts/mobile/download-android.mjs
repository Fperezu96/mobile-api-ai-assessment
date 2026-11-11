import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const app = JSON.parse(await readFile('apps/android-manifest.json', 'utf8'));
await mkdir('apps/downloads', { recursive: true });
const verifyOnly = process.argv.includes('--verify-only');
let bytes;
if (verifyOnly) bytes = await readFile('apps/downloads/' + app.filename);
else {
  const response = await fetch(app.url, { signal: AbortSignal.timeout(120000) });
  if (!response.ok) throw new Error('Download failed: HTTP ' + response.status);
  bytes = Buffer.from(await response.arrayBuffer());
}
if (createHash('sha256').update(bytes).digest('hex') !== app.sha256) throw new Error('APK checksum mismatch');
if (!verifyOnly) await writeFile('apps/downloads/' + app.filename, bytes);
console.log('APK ' + app.version + '; SHA256 verified.');
