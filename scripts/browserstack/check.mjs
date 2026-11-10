import { mkdir, writeFile } from 'node:fs/promises';
const user = process.env.BROWSERSTACK_USERNAME;
const key = process.env.BROWSERSTACK_ACCESS_KEY;
if (!user || !key) {
  console.error('BrowserStack no configurado. Completa BROWSERSTACK_USERNAME y BROWSERSTACK_ACCESS_KEY en .env local.');
  process.exit(2);
}
const response = await fetch('https://api-cloud.browserstack.com/app-automate/plan.json', {
  headers: { Authorization: 'Basic ' + Buffer.from(user + ':' + key).toString('base64') },
  signal: AbortSignal.timeout(20000),
});
const result = { checkedAt: new Date().toISOString(), service: 'App Automate', httpStatus: response.status(), authenticated: response.ok };
await mkdir('artifacts/browserstack', { recursive: true });
await writeFile('artifacts/browserstack/connection.json', JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
if (!response.ok) process.exitCode = 1;
