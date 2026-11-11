import type { Browser } from 'webdriverio';
import type { TestInfo, TestStepInfo } from '@playwright/test';
import { writeFile } from 'node:fs/promises';

// Solo se registran comandos que cambian la pantalla, sin valores de formularios.
export function interactionName(command: string, args: unknown[]): string | undefined {
  const names: Record<string, string> = {
    elementClick: 'Pulsar control', elementSendKeys: 'Ingresar texto (valor omitido)',
    elementClear: 'Vaciar campo', back: 'Volver con Android', hideKeyboard: 'Ocultar teclado',
  };
  if (names[command]) return names[command];
  if (command === 'executeScript' && typeof args[0] === 'string' && /mobile: (click|doubleClick|longClick|scroll|swipe|drag|fling)Gesture/.test(args[0])) return args[0];
  if (command === 'findElement' && typeof args[1] === 'string' && args[1].includes('scrollIntoView')) return 'Desplazar hasta el control';
  return undefined;
}

export class NativeEvidence {
  driver?: Browser;
  current?: TestStepInfo;
  currentTitle = '';
  private videoStartedAt = 0;
  private sequence = 0;
  private recording = false;
  private active?: {number: number; action: string; startedAt: string};
  private readonly interactions: object[] = [];
  readonly errors: string[] = [];
  constructor(private readonly info: TestInfo) {}

  private async attempt(label: string, action: () => Promise<void>): Promise<void> {
    try { await action(); }
    catch (error) { this.errors.push(label + ': ' + String(error)); }
  }
  async screenshot(label: string): Promise<void> {
    await this.attempt(label, async () => {
      if (!this.driver) throw new Error('Sesión nativa no disponible');
      const body = Buffer.from(await this.driver.takeScreenshot(), 'base64');
      if (body.length < 8 || body.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a') throw new Error('Captura PNG vacía o inválida');
      await (this.current || this.info).attach(label, {body, contentType: 'image/png'});
    });
  }
  async beforeCommand(command: string, args: unknown[]): Promise<void> {
    const action = interactionName(command, args);
    if (!this.current || !action) return;
    this.active = {number: ++this.sequence, action, startedAt: new Date().toISOString()};
    await this.screenshot(`${this.sequence}. Antes · ${action}`);
  }
  async afterCommand(command: string, args: unknown[], error?: Error): Promise<void> {
    if (!this.current || !interactionName(command, args) || !this.active) return;
    const interaction = {...this.active, step: this.currentTitle, videoOffsetMs: Date.now() - this.videoStartedAt, finishedAt: new Date().toISOString(), status: error ? 'failed' : 'passed'};
    this.active = undefined;
    this.interactions.push(interaction);
    await this.attempt('Registro de interacción', () => this.current!.attach(`${interaction.number}. ${interaction.action}`, {body: JSON.stringify(interaction, null, 2), contentType: 'application/json'}));
    await this.screenshot(`${interaction.number}. Después · ${interaction.action}`);
  }
  async startVideo(): Promise<void> {
    await this.attempt('Inicio de video', async () => {
      await this.driver!.startRecordingScreen({timeLimit: 180, bitRate: 2000000, videoSize: '720x1280'});
      this.recording = true;
      this.videoStartedAt = Date.now();
    });
  }
  async finish(): Promise<void> {
    if (this.recording) await this.attempt('Video del caso', async () => {
      const video = Buffer.from(await this.driver!.stopRecordingScreen(), 'base64');
      if (video.length < 12 || video.subarray(4, 8).toString() !== 'ftyp') throw new Error('Video MP4 vacío o inválido');
      const file = this.info.outputPath('interacciones-android.mp4');
      await writeFile(file, video);
      await this.info.attach('Video del caso Android', {path: file, contentType: 'video/mp4'});
    });
    await this.attempt('Registro de interacciones', () => this.info.attach('Interacciones del caso (sin valores de formularios)', {body: JSON.stringify(this.interactions, null, 2), contentType: 'application/json'}));
  }
}
