import type { Product } from '../../models/product.js';
import type { ProductColor } from '../../models/product-color.js';
import type { ProductDetail } from '../../contracts/product-detail.contract.js';
import { NativeUi, resourceSelector, usdToCents } from '../../support/native-ui.js';
export class ProductDetailScreen implements ProductDetail {
  constructor(private readonly ui: NativeUi) {}
  async waitForLoaded(): Promise<void> {
    await this.ui.show('productTV');
    // Room actualiza el título después de montar la pantalla.
    await this.ui.driver.waitUntil(async () => (await this.ui.element('productTV').getText()) !== 'Products', { timeout: 10000 });
  }
  async read(): Promise<Product> {
    const name = await this.ui.element('productTV').getText();
    await this.ui.show('priceTV');
    return { name, unitPriceCents: usdToCents(await this.ui.element('priceTV').getText()) };
  }
  async setQuantity(quantity: number): Promise<void> {
    if (!Number.isSafeInteger(quantity) || quantity < 0 || quantity > 99) throw new Error('Cantidad fuera de rango.');
    await this.ui.show('productHeightLightsTV');
    await this.ui.show('noTV');
    let current = Number(await this.ui.element('noTV').getText());
    if (!Number.isSafeInteger(current) || current < 0 || current > 99) throw new Error('Control de cantidad inválido.');
    while (current !== quantity) {
      const delta = quantity > current ? 1 : -1;
      await this.ui.tap(delta > 0 ? 'plusIV' : 'minusIV');
      current += delta;
      await this.ui.driver.waitUntil(async () => (await this.ui.element('noTV').getText()) === String(current), { timeout: 5000 });
    }
  }
  async addButtonEnabled(): Promise<boolean> {
    await this.ui.show('productHeightLightsTV');
    return this.ui.element('cartBt').isEnabled();
  }
  async selectColor(color: ProductColor): Promise<void> {
    await this.ui.show('colorRV');
    const target = await this.ui.driver.$('~' + color + ' color');
    await target.waitForDisplayed({timeout: 10000});
    await this.ui.driver.execute('mobile: clickGesture', {elementId: target.elementId});
    await this.ui.driver.waitUntil(() => this.colorSelected(color), {timeout: 5000, timeoutMsg: 'El color no quedó seleccionado: ' + color});
  }
  async colorSelected(color: ProductColor): Promise<boolean> {
    const selector = resourceSelector('colorIV') + '.description(' + JSON.stringify(color + ' color') + ').fromParent(' + resourceSelector('aroundIV') + ')';
    return this.ui.driver.$('android=' + selector).isDisplayed();
  }
  async colorSwatch(color: ProductColor): Promise<Buffer> {
    await this.ui.show('colorRV');
    const element = await this.ui.driver.$('~' + color + ' color');
    return Buffer.from(await this.ui.driver.takeElementScreenshot(await element.elementId), 'base64');
  }
  async productImage(): Promise<Buffer> {
    await this.ui.show('productTV');
    const element = await this.ui.element('productIV');
    return Buffer.from(await this.ui.driver.takeElementScreenshot(await element.elementId), 'base64');
  }
  async openReview(rating: number): Promise<void> {
    if (!Number.isSafeInteger(rating) || rating < 1 || rating > 5) throw new Error('La valoración debe estar entre 1 y 5.');
    await this.ui.tap('start' + rating + 'IV');
  }
  async addToCart(): Promise<void> {
    // El marcador inferior deja el botón completo dentro del área desplazable.
    await this.ui.show('productHeightLightsTV');
    await this.ui.show('cartBt');
    await this.ui.tap('cartBt');
  }
}
