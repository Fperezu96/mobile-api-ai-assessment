import {summarizeRun} from '../quality/summarize.mjs';
import fs from 'node:fs';
import path from 'node:path';
import {spawn} from 'node:child_process';
const args=process.argv.slice(2);
const runId=new Date().toISOString().replace(/[:.]/g,'-');
const directory=path.resolve('reports/api',runId);
if(!args.includes('--list')){
  fs.mkdirSync(directory,{recursive:true});
  fs.writeFileSync('reports/api/latest.json',JSON.stringify({runId,directory},null,2));
}
const child=spawn(process.execPath,['--env-file-if-exists=.env','node_modules/@playwright/test/cli.js','test','-c','config/api/playwright.config.ts',...args],{stdio:'inherit',env:{...process.env,API_RUN_ID:runId}});
child.on('error',error=>{console.error(error);process.exitCode=1});
child.on('exit',code=>{
  process.exitCode=code ?? 1;
  if(!args.includes('--list')){try{summarizeRun(directory);}catch(error){console.error('No se pudo generar el resumen:',String(error));process.exitCode=code || 1;}}
});
