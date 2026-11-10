import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
const latest = JSON.parse(fs.readFileSync('reports/performance/latest.json', 'utf8'));
const runId = process.argv[2] || latest.runId;
if (!/^[0-9TZ-]+$/.test(runId)) throw new Error('Identificador de ejecución inválido.');
const root = path.resolve('reports/performance', runId);
if (!fs.existsSync(path.join(root, 'index.html'))) throw new Error('No existe el informe de esta ejecución.');
const mime = {'.html':'text/html; charset=utf-8', '.json':'application/json', '.png':'image/png', '.txt':'text/plain; charset=utf-8', '.xml':'application/xml'};
const server = http.createServer((request,response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    const file = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
    if (!file.startsWith(root + path.sep)) { response.writeHead(403); response.end(); return; }
    const body = fs.readFileSync(file);
    response.setHeader('Content-Type', mime[path.extname(file)] || 'application/octet-stream');
    response.end(body);
  } catch { response.writeHead(404); response.end('No disponible'); }
});
server.listen(9324, '127.0.0.1', () => console.log('Informe Android: http://127.0.0.1:9324 · Ctrl+C para cerrar'));
server.on('error', error => { console.error(error.message); process.exitCode = 1; });
