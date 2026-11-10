import fs from 'node:fs';
import path from 'node:path';
export function summarizeRun(directory) {
  const report=JSON.parse(fs.readFileSync(path.join(directory,'results.json'),'utf8'));
  const cases=[];
  function failedSteps(steps,parent=[]){
    return (steps || []).flatMap(step=>{
      const route=[...parent,step.title];
      const nested=failedSteps(step.steps,route);
      return nested.length ? nested : step.error ? [{path:route,message:step.error.message || step.error.value}] : [];
    });
  }
  function visit(suites){
    for(const suite of suites){
      for(const spec of suite.specs || []){
        for(const test of spec.tests){
          const result=test.results.at(-1);
          if(!result)continue;
          cases.push({project:test.projectName,title:spec.title,tags:spec.tags || [],status:result.status,durationMs:result.duration,
            failedSteps:failedSteps(result.steps),errors:result.errors || [],attachments:(result.attachments || []).map(item=>({name:item.name,contentType:item.contentType,path:item.path}))});
        }
      }
      visit(suite.suites || []);
    }
  }
  visit(report.suites || []);
  const summary={runId:path.basename(directory),stats:report.stats,cases};
  fs.writeFileSync(path.join(directory,'execution-summary.json'),JSON.stringify(summary,null,2));
  const projects=[...new Set(cases.map(item=>item.project))];
  for(const project of projects){
    const selected=cases.filter(item=>item.project===project);
    console.log(project+': '+selected.filter(item=>item.status==='passed').length+' aprobados, '+selected.filter(item=>item.status==='failed'||item.status==='timedOut').length+' fallidos, '+selected.filter(item=>item.status==='skipped').length+' omitidos');
  }
  console.log('Resumen y pasos fallidos: '+path.join(directory,'execution-summary.json'));
  return summary;
}
