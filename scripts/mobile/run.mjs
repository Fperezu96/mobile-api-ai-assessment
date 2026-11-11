import {summarizeRun} from '../quality/summarize.mjs';
import {waitForAppium} from './wait-for-appium.mjs';
import {spawn} from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
const args=process.argv.slice(2);
const listOnly=args.includes('--list');
const runId=new Date().toISOString().replace(/[:.]/g,'-');
process.env.MOBILE_DATA_SEED ||= runId;
console.log('Semilla de datos móviles: '+process.env.MOBILE_DATA_SEED);
const root=path.resolve('reports/mobile',runId);
if(!listOnly){
  fs.mkdirSync(root,{recursive:true});
  fs.writeFileSync('reports/mobile/latest.json',JSON.stringify({runId,directory:root},null,2));
  console.log('Evidencia de esta ejecución: '+root);
  await waitForAppium();
}else{
  console.log('Descubrimiento de escenarios; no se crearán sesiones Appium.');
}
const child=spawn(process.execPath,['node_modules/@playwright/test/cli.js','test','-c','config/mobile/playwright.config.ts',...args],{env:{...process.env,MOBILE_RUN_ID:runId},stdio:'inherit'});
child.on('error',error=>{console.error(error.message);process.exitCode=1});
child.on('exit',code=>{
  process.exitCode=code ?? 1;
  if(!args.includes('--list')){try{summarizeRun(root);}catch(error){console.error('No se pudo generar el resumen:',String(error));process.exitCode=code || 1;}}
});
