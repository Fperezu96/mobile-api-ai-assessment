import type { Browser } from 'webdriverio';

export const appPackage = 'com.saucelabs.mydemoapp.android';
export const resourceSelector = (name: string) =>
  'new UiSelector().resourceId(' + JSON.stringify(appPackage + ':id/' + name) + ')';

export function usdToCents(text: string): number {
  const match = /^\$\s*(\d+)\.(\d{1,2})$/.exec(text.trim());
  if (!match) throw new Error('Importe USD no reconocido: ' + text);
  return Number(match[1]) * 100 + Number(match[2].padEnd(2, '0'));
}

export class NativeUi {
  constructor(readonly driver: Browser) {}
  element(name: string) { return this.driver.$('id=' + appPackage + ':id/' + name); }
  async visible(name: string): Promise<boolean> { return this.element(name).isDisplayed(); }
  async wait(name: string): Promise<void> {
    await this.element(name).waitForDisplayed({ timeout: 15000 });
  }
  async showSelector(selector: string): Promise<void> {
    const element = this.driver.$('android=' + selector);
    if (!(await element.isDisplayed())) {
      const currentPackage = await this.driver.getCurrentPackage();
      if (currentPackage !== appPackage) throw new Error('La app dejó de estar en primer plano al buscar el elemento; paquete actual: ' + currentPackage);
      await this.driver.$('android=new UiScrollable(new UiSelector().scrollable(true)).setMaxSearchSwipes(6).scrollIntoView(' + selector + ')').getElement();
    }
    await element.waitForDisplayed({ timeout: 10000 });
  }
  async tap(name: string): Promise<void> {
    await this.show(name);
    await this.element(name).waitForEnabled({timeout: 10000});
    let previous = '';
    let stableSamples = 0;
    // Esperar a que termine el desplazamiento evita pulsar coordenadas en movimiento.
    await this.driver.waitUntil(async () => {
      const element = await this.element(name);
      const location = await element.getLocation();
      const size = await element.getSize();
      const bounds = JSON.stringify({location, size});
      stableSamples = bounds === previous ? stableSamples + 1 : 0;
      previous = bounds;
      return stableSamples >= 2 && size.width > 0 && size.height > 0;
    }, {timeout: 10000, interval: 200, timeoutMsg: 'El control nativo no estabilizó su posición: ' + name});
    const element = await this.element(name);
    await this.driver.execute('mobile: clickGesture', {elementId: element.elementId});
  }
  async show(name: string): Promise<void> { await this.showSelector(resourceSelector(name)); }
}
