import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
const latest=JSON.parse(fs.readFileSync('reports/mobile/latest.json','utf8'));
const report=JSON.parse(fs.readFileSync(path.join(latest.directory,'results.json'),'utf8'));
let count=0;
function visit(suites){
 for(const suite of suites){
  for(const spec of suite.specs || [])for(const test of spec.tests){
   const result=test.results.at(-1);
   if(!result || result.status==='skipped')continue;
   const attachments=result.attachments || [];
   const video=attachments.find(item=>item.contentType==='video/mp4');
   if(!video?.path)throw Error('Falta video: '+spec.title);
   const probe=JSON.parse(execFileSync('ffprobe',['-v','error','-select_streams','v:0','-show_entries','stream=width,height,duration','-of','json',video.path],{encoding:'utf8'}));
   const stream=probe.streams?.[0];
   if(!stream || !(Number(stream.duration)>0) || !stream.width || !stream.height)throw Error('Video sin contenido: '+spec.title);
   const png=attachments.filter(item=>item.contentType==='image/png');
   if(!png.some(item=>item.name.startsWith('Inicio del paso')) || !png.some(item=>item.name.startsWith('Fin del paso')))throw Error('Faltan capturas de pasos: '+spec.title);
   const before=png.filter(item=>/^\d+\. Antes/.test(item.name));
   const after=png.filter(item=>/^\d+\. Después/.test(item.name));
   if(!before.length || before.length!==after.length)throw Error('Evidencia de interacciones incompleta: '+spec.title);
   console.log(`${spec.title}: ${png.length} capturas, ${before.length} interacciones, video ${stream.width}x${stream.height} / ${Number(stream.duration).toFixed(1)} s`);
   count++;
  }
  visit(suite.suites || []);
 }
}
visit(report.suites || []);
if(!count)throw Error('No se encontraron casos ejecutados para verificar evidencia');
console.log('Evidencia nativa verificada en '+count+' casos.');
