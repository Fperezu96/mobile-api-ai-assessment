import {spawn} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {setTimeout as pause} from 'node:timers/promises';
const suite=process.env.MOBILE_SUITE || 'regression';
if(!['smoke','regression'].includes(suite))throw new Error('MOBILE_SUITE debe ser smoke o regression.');
const port=Number(process.env.APPIUM_PORT || 4723);
const url='http://127.0.0.1:'+port+'/status';
const stamp=new Date().toISOString().replace(/[:.]/g,'-');
fs.mkdirSync('artifacts/android-local',{recursive:true});
const log=fs.openSync(path.resolve('artifacts/android-local','ci-appium-'+stamp+'.log'),'a');
let server;
function run(command,args) {
  return new Promise((resolve,reject)=>{
    const child=spawn(command,args,{stdio:'inherit',env:process.env});
    child.on('error',reject);
    child.on('exit',code=>resolve(code ?? 1));
  });
}
try {
  let busy=false;
  try{const response=await fetch(url,{signal:AbortSignal.timeout(1000)});busy=response.ok;}catch{}
  if(busy)throw new Error('Ya hay un servidor en el puerto elegido. Este comando debe controlar su propio Appium.');
  server=spawn(process.execPath,['scripts/mobile/appium.mjs','start'],{stdio:['ignore',log,log],env:process.env});
  let serverError;
  server.on('error',error=>{serverError=error});
  let ready=false;
  for(let attempt=0;attempt<120;attempt++){
    if(serverError)throw serverError;
    if(server.exitCode!==null)throw new Error('Appium terminó antes de estar disponible. Revisa el log.');
    try{const response=await fetch(url,{signal:AbortSignal.timeout(1000)});const data=await response.json();if(response.ok&&data.value?.ready===true){ready=true;break;}}catch{}
    await pause(500);
  }
  if(!ready)throw new Error('Appium no estuvo listo en el tiempo permitido.');
  const args=['scripts/mobile/run.mjs',...(suite==='smoke'?['--grep','@smoke']:[])];
  process.exitCode=await run(process.execPath,args);
} catch(error) {
  console.error(String(error));
  process.exitCode=1;
} finally {
  if(server && server.exitCode===null){
    if(process.platform==='win32'){
      await run('taskkill',['/PID',String(server.pid),'/T','/F']);
    }else{
      const exited=new Promise(resolve=>server.once('exit',resolve));
      server.kill('SIGTERM');
      await Promise.race([exited,pause(5000)]);
      if(server.exitCode===null)server.kill('SIGKILL');
    }
  }
  fs.closeSync(log);
}
