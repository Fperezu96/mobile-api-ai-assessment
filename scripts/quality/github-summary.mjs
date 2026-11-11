import fs from 'node:fs';import path from 'node:path';
const product=process.argv[2];if(!['api','mobile'].includes(product))throw Error('Indicar api o mobile.');
const latest=path.join('reports',product,'latest.json');
let markdown='## '+(product==='api'?'API de reservas':'Android nativo')+'\n\n';
const steps=JSON.parse(process.env.QA_STEPS || '{}');
if(Object.keys(steps).length){
 markdown+='| Etapa / paso | Resultado |\n| --- | --- |\n';
 for(const [id, step] of Object.entries(steps)){
  markdown+='| '+id.replace(/^etapa_/, '').replaceAll('_',' ')+' | '+step.outcome+' |\n';
 }
 markdown+='\nLos pasos omitidos (skipped) no se ejecutaron; revisar el primer failure y sus logs.\n\n';
}
if(!fs.existsSync(latest))markdown+='No se generó una ejecución. Revisar instalación, credenciales o arranque en los logs.\n';
else{
 const run=JSON.parse(fs.readFileSync(latest,'utf8'));
 const summaryPath=path.join(run.directory,'execution-summary.json');
 if(!fs.existsSync(summaryPath))markdown+='La ejecución no produjo un resumen completo. Revisar los logs y artefactos.\n';
 else{
  const summary=JSON.parse(fs.readFileSync(summaryPath,'utf8'));
  markdown+='Ejecución: '+summary.runId+'\n\n| Caso | Resultado | Duración |\n| --- | --- | --- |\n';
  for(const item of summary.cases){
   const title=item.title.replaceAll('|',' / ').replaceAll('\n',' ');
   markdown+='| '+title+' | '+item.status+' | '+(item.durationMs/1000).toFixed(1)+' s |\n';
  }
  markdown+='\nDescargar el artefacto de este job para abrir HTML, JUnit, JSON y adjuntos.\n';
 }
}
console.log(markdown);if(process.env.GITHUB_STEP_SUMMARY)fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,markdown);
