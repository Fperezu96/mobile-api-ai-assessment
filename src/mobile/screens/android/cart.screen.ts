import type { Cart } from '../../contracts/cart.contract.js';
import type { CartSnapshot } from '../../models/cart-snapshot.js';
import { NativeUi, usdToCents, appPackage } from '../../support/native-ui.js';
export class CartScreen implements Cart {
  constructor(private readonly ui: NativeUi) {}
  async waitForLoaded(): Promise<void> { await this.ui.wait('cartCL'); await this.ui.wait('totalPriceTV'); }
  async read(): Promise<CartSnapshot> {
    const products = this.ui.element('productRV');
    const titles = await products.$$('id=' + appPackage + ':id/titleTV');
    const names: string[] = [];
    for (const title of titles) names.push(await title.getText());
    await this.ui.show('priceTV');
    const unitPriceCents = usdToCents(await products.$('id=' + appPackage + ':id/priceTV').getText());
    await this.ui.show('noTV');
    return { names, quantity: Number(await products.$('id=' + appPackage + ':id/noTV').getText()), unitPriceCents,
      totalCents: usdToCents(await this.ui.element('totalPriceTV').getText()), itemCount: await this.ui.element('itemsTV').getText() };
  }
  async setQuantity(quantity: number): Promise<void> {
    if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > 99) throw new Error('Cantidad fuera del rango de automatización 1..99.');
    await this.ui.show('noTV');
    let current = Number(await this.ui.element('noTV').getText());
    while (current !== quantity) {
      const delta = quantity > current ? 1 : -1;
      await this.ui.tap(delta > 0 ? 'plusIV' : 'minusIV');
      current += delta;
      await this.ui.driver.waitUntil(async () => Number(await this.ui.element('noTV').getText()) === current,
        {timeout: 5000, timeoutMsg: 'El carrito no reflejó la cantidad esperada: ' + current});
    }
  }
  async decreaseOnlyItem(): Promise<void> { await this.ui.tap('minusIV'); }
  async colorSwatch(): Promise<Buffer> {
    await this.ui.show('colorIV');
    const element = await this.ui.element('colorIV');
    return Buffer.from(await this.ui.driver.takeElementScreenshot(await element.elementId), 'base64');
  }
  async tapColorSwatch(): Promise<void> { await this.ui.tap('colorIV'); }
  async removeOnlyItem(): Promise<void> { await this.ui.show('removeBt'); await this.ui.element('removeBt').click(); }
  async emptyStateVisible(): Promise<boolean> { return this.ui.visible('noItemTitleTV'); }
  async totalVisible(): Promise<boolean> { return this.ui.visible('totalPriceTV'); }
}
