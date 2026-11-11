import {spawn} from 'node:child_process';
const suite=process.env.MOBILE_SUITE || 'smoke';
const patterns={smoke:'@smoke',regression:'@regression',catalog:'@catalog',exploratory:'@random'};
if(!Object.hasOwn(patterns,suite))throw Error('MOBILE_SUITE no es una selección válida.');
const child=spawn(process.execPath,['scripts/mobile/run.mjs','--grep',patterns[suite],...process.argv.slice(2)],{stdio:'inherit',env:process.env});
child.on('error',error=>{console.error(error.message);process.exitCode=1;});
child.on('exit',code=>{process.exitCode=code??1;});
