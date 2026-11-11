import {test, expect, type TestInfo, type TestStepInfo} from '@playwright/test';
import type {Browser} from 'webdriverio';
import {NativeEvidence, interactionName} from '../support/native-evidence.js';

test('Registra cada interacción dentro de su paso sin valores del formulario', async () => {
  const attachments: {name: string; body: Buffer | string}[] = [];
  const attach = async (name: string, options: {body: Buffer | string}) => {attachments.push({name, body: options.body});};
  const evidence = new NativeEvidence({attach} as unknown as TestInfo);
  evidence.current = {attach} as unknown as TestStepInfo;
  evidence.currentTitle = 'Enviar formulario';
  evidence.driver = {takeScreenshot: async () => Buffer.from('89504e470d0a1a0a','hex').toString('base64')} as Browser;
  await evidence.beforeCommand('elementSendKeys', ['element-1','secreto-no-publicar']);
  await evidence.afterCommand('elementSendKeys', ['element-1','secreto-no-publicar']);
  expect(attachments.map(item=>item.name)).toEqual(['1. Antes · Ingresar texto (valor omitido)','1. Ingresar texto (valor omitido)','1. Después · Ingresar texto (valor omitido)']);
  expect(JSON.stringify(attachments)).not.toContain('secreto-no-publicar');
  expect(String(attachments[1].body)).toContain('Enviar formulario');
});

test('Una captura inválida se conserva como error sin bloquear el registro siguiente', async () => {
  const evidence=new NativeEvidence({attach:async()=>{}} as unknown as TestInfo);
  evidence.current={attach:async()=>{}} as unknown as TestStepInfo;
  evidence.driver={takeScreenshot:async()=>''} as Browser;
  await evidence.beforeCommand('elementClick',['element-1']);
  await evidence.afterCommand('elementClick',['element-1'],new Error('Fallo original'));
  expect(evidence.errors).toHaveLength(2);
  expect(evidence.errors[0]).toContain('PNG vacía o inválida');
});

test('Filtra lecturas y captura gestos y desplazamientos implícitos', () => {
  expect(interactionName('getElementText',[])).toBeUndefined();
  expect(interactionName('takeScreenshot',[])).toBeUndefined();
  expect(interactionName('executeScript',['mobile: scrollGesture'])).toBeDefined();
  expect(interactionName('findElement',['-android uiautomator','new UiScrollable().scrollIntoView(...)'])).toBeDefined();
});

test('WebdriverIO invoca los hooks para click, gesto y Back sin capturas recursivas', async () => {
  const {createServer}=await import('node:http');
  const {remote}=await import('webdriverio');
  const attachments: string[]=[];
  const image=Buffer.from('89504e470d0a1a0a','hex').toString('base64');
  // Servidor W3C simulado: prueba la integración del cliente, no sustituye Android real.
  const server=createServer((request,response)=>{
    response.setHeader('Content-Type','application/json');
    if(request.url==='/session' && request.method==='POST')response.end(JSON.stringify({value:{sessionId:'verification',capabilities:{platformName:'Android'}}}));
    else if(request.url?.endsWith('/element') && request.method==='POST')response.end(JSON.stringify({value:{'element-6066-11e4-a52e-4f735466cecf':'target'}}));
    else response.end(JSON.stringify({value:request.url?.endsWith('/screenshot')?image:null}));
  });
  await new Promise<void>(resolve=>server.listen(0,'127.0.0.1',resolve));
  const address=server.address();
  if(!address || typeof address==='string')throw Error('Servidor de verificación no disponible');
  const evidence=new NativeEvidence({attach:async(name:string)=>{attachments.push(name);}} as unknown as TestInfo);
  let driver: Browser | undefined;
  try {
    driver=await remote({hostname:'127.0.0.1',port:address.port,capabilities:{platformName:'Android'},logLevel:'silent',
      beforeCommand:[(name,args)=>evidence.beforeCommand(name,args)],
      afterCommand:[(name,args,_result,error)=>evidence.afterCommand(name,args,error)]});
    evidence.driver=driver;
    evidence.current={attach:async(name:string)=>{attachments.push(name);}} as unknown as TestStepInfo;
    await driver.$('id=target').click();
    await driver.elementClick('target');
    await driver.execute('mobile: clickGesture',{elementId:'target'});
    await driver.back();
    expect(attachments).toHaveLength(12);
    expect(attachments.filter(name=>name.includes('Antes'))).toHaveLength(4);
    expect(attachments.filter(name=>name.includes('Después'))).toHaveLength(4);
  } finally {
    evidence.current=undefined;
    if(driver)await driver.deleteSession();
    server.closeAllConnections();
    await new Promise<void>(resolve=>server.close(()=>resolve()));
  }
});
