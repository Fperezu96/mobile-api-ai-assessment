import {summarizeRun} from './summarize.mjs';
import fs from 'node:fs';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {waitForAppium} from '../mobile/wait-for-appium.mjs';
const args=process.argv.slice(2);
const listOnly=args.includes('--list');
const runId=new Date().toISOString().replace(/[:.]/g,'-');
process.env.MOBILE_DATA_SEED ||= runId;
console.log('Semilla de datos móviles: '+process.env.MOBILE_DATA_SEED);
const directory=path.resolve('reports/combined',runId);
if(!listOnly){
  fs.mkdirSync(directory,{recursive:true});
  fs.writeFileSync('reports/combined/latest.json',JSON.stringify({runId,directory},null,2));
  await waitForAppium();
  console.log('Reporte conjunto: '+directory);
}
const child=spawn(process.execPath,['--env-file-if-exists=.env','node_modules/@playwright/test/cli.js','test','-c','config/combined/playwright.config.ts',...args],{stdio:'inherit',env:{...process.env,QUALITY_RUN_ID:runId,MOBILE_RUN_ID:runId}});
child.on('error',error=>{console.error(error.message);process.exitCode=1});
child.on('exit',code=>{
  process.exitCode=code ?? 1;
  if(!args.includes('--list')){try{summarizeRun(directory);}catch(error){console.error('No se pudo generar el resumen:',String(error));process.exitCode=code || 1;}}
});
