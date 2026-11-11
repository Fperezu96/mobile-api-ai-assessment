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
