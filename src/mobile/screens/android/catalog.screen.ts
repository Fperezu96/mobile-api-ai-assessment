import type { Catalog } from '../../contracts/catalog.contract.js';
import { NativeUi, resourceSelector, appPackage } from '../../support/native-ui.js';
export class CatalogScreen implements Catalog {
  constructor(private readonly ui: NativeUi) {}
  async waitForLoaded(): Promise<void> { await this.ui.wait('productRV'); await this.ui.wait('titleTV'); }
  async productVisible(name: string): Promise<boolean> {
    return this.ui.driver.$('android=' + resourceSelector('titleTV') + '.text(' + JSON.stringify(name) + ')').isDisplayed();
  }
  async scrollToProduct(name: string, direction: 'up' | 'down'): Promise<number> {
    let gestures = 0;
    while (!(await this.productVisible(name)) && gestures < 6) {
      const currentPackage = await this.ui.driver.getCurrentPackage();
      if (currentPackage !== appPackage) throw new Error('No se puede desplazar el catálogo fuera de la app: ' + currentPackage);
      const container = await this.ui.element('scrollView');
      await container.waitForDisplayed({timeout: 10000});
      const canScrollMore = await this.ui.driver.execute('mobile: scrollGesture', {elementId: container.elementId, direction, percent: 0.75});
      gestures++;
      if (!canScrollMore && !(await this.productVisible(name))) break;
    }
    if (!(await this.productVisible(name))) throw new Error('El scroll nativo no permitió localizar ' + name);
    return gestures;
  }
  async findProduct(name: string): Promise<void> {
    await this.ui.showSelector(resourceSelector('titleTV') + '.text(' + JSON.stringify(name) + ')', 16);
  }
  async openProduct(name: string): Promise<void> {
    // El título identifica el producto, pero el listener de la app pertenece a su imagen.
    const selector = resourceSelector('titleTV') + '.text(' + JSON.stringify(name) + ').fromParent(' + resourceSelector('productIV') + ')';
    await this.ui.showSelector(selector, 16);
    await this.ui.driver.$('android=' + selector).click();
  }
}
