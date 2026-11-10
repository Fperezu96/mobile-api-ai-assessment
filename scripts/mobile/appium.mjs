import path from 'node:path';
import fs from 'node:fs';
import {spawn} from 'node:child_process';
const root=process.cwd();
const mode=process.argv[2] || 'start';
const sdk=process.env.ANDROID_HOME || 'C:/dev/.tools/android-sdk';
const java=process.env.JAVA_HOME || 'C:/Program Files/Android/Android Studio/jbr';
const env={...process.env,ANDROID_HOME:sdk,ANDROID_SDK_ROOT:sdk,JAVA_HOME:java,PATH:[path.join(java,'bin'),path.join(sdk,'platform-tools'),process.env.PATH].join(path.delimiter)};
delete env.APPIUM_HOME;
fs.mkdirSync('artifacts/android-local',{recursive:true});
const main=path.resolve('node_modules/appium/build/lib/main.js');
const args= mode==='setup' ? ['driver','list','--installed'] :
  mode==='doctor' ? ['driver','doctor','uiautomator2'] :
  ['--address','127.0.0.1','--port',process.env.APPIUM_PORT || '4723','--base-path','/','--log',path.resolve('artifacts/android-local','appium-'+new Date().toISOString().replace(/[:.]/g,'-')+'.log'),'--log-level','info'];
const child=spawn(process.execPath,[main,...args],{cwd:root,env,stdio:'inherit'});
child.on('error',error=>{console.error(error.message);process.exitCode=1});
child.on('exit',code=>{process.exitCode=code ?? 1});
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>child.kill(signal));
