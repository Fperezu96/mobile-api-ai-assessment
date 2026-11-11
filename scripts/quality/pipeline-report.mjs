import fs from 'node:fs';
import path from 'node:path';
const product=process.argv[2];
if(!['api','android'].includes(product))throw Error('Producto desconocido');
const jobs=JSON.parse(process.env.QA_JOBS || '{}');
const summaries=[];
function visit(directory){
 if(!fs.existsSync(directory))return;
 for(const item of fs.readdirSync(directory,{withFileTypes:true})){
  const file=path.join(directory,item.name);
  if(item.isDirectory())visit(file);
  else if(item.name==='execution-summary.json')summaries.push(JSON.parse(fs.readFileSync(file,'utf8')));
 }
}
visit('evidence');
const cell=value=>String(value).replaceAll('|',' / ').replaceAll('\n',' ');
let markdown=`# Reporte final · ${product}\n\n| Job / etapa | Resultado |\n| --- | --- |\n`;
for(const [name,job] of Object.entries(jobs))markdown+=`| ${cell(name)} | ${job.result} |\n`;
markdown+='\nLos pasos detallados están en cada job de ejecución. Un job omitido no equivale a una prueba aprobada.\n';
let incomplete=Object.values(jobs).some(job=>job.result!=='success') || summaries.length===0;
if(!summaries.length)markdown+='\nNo hay resultados de pruebas; revisar la primera etapa fallida.\n';
for(const summary of summaries){
 markdown+=`\nEjecución: ${summary.runId}\n\n| Caso | Resultado |\n| --- | --- |\n`;
 for(const test of summary.cases){
  markdown+=`| ${cell(test.title)} | ${test.status} |\n`;
  if(test.status!=='passed')incomplete=true;
 }
}
markdown+='\nEl artefacto reporte-final contiene el HTML original con sus adjuntos. En Android, expandir cada paso para ver las capturas antes/después e interacciones; abrir Video del caso Android para reproducir el MP4.\n';
fs.mkdirSync('reports/ci',{recursive:true});
fs.writeFileSync(`reports/ci/${product}.md`,markdown);
fs.writeFileSync(`reports/ci/${product}.json`,JSON.stringify({product,jobs,summaries},null,2));
if(process.env.GITHUB_STEP_SUMMARY)fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,markdown);
console.log(markdown);
if(incomplete)process.exitCode=1;
