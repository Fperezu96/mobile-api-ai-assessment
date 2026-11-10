import type { Catalog, ProductDetail, Cart, Header, CartSnapshot } from '../../contracts/shop.contracts.js';
import { NativeUi, resourceSelector, usdToCents, appPackage } from '../../support/native-ui.js';

export class CatalogScreen implements Catalog {
  constructor(private readonly ui: NativeUi) {}
  async waitForLoaded(): Promise<void> { await this.ui.wait('productRV'); await this.ui.wait('titleTV'); }
  async openProduct(name: string): Promise<void> {
    // El título identifica el producto, pero el listener de la app pertenece a su imagen.
    const selector = resourceSelector('titleTV') + '.text(' + JSON.stringify(name) + ').fromParent(' + resourceSelector('productIV') + ')';
    await this.ui.showSelector(selector);
    await this.ui.driver.$('android=' + selector).click();
  }
}
export class HeaderScreen implements Header {
  constructor(private readonly ui: NativeUi) {}
  async openCart(): Promise<void> { await this.ui.wait('cartRL'); await this.ui.element('cartRL').click(); }
  async waitForQuantity(quantity: number): Promise<void> {
    await this.ui.driver.waitUntil(async () => await this.ui.visible('cartTV') && (await this.ui.element('cartTV').getText()) === String(quantity),
      { timeout: 10000, timeoutMsg: 'El indicador del carrito no muestra la cantidad esperada.' });
  }
}
export class ProductDetailScreen implements ProductDetail {
  constructor(private readonly ui: NativeUi) {}
  async waitForLoaded(): Promise<void> {
    await this.ui.show('productTV');
    // Room actualiza el título después de montar la pantalla.
    await this.ui.driver.waitUntil(async () => (await this.ui.element('productTV').getText()) !== 'Products', { timeout: 10000 });
  }
  async read(): Promise<{name: string; unitPriceCents: number}> {
    const name = await this.ui.element('productTV').getText();
    await this.ui.show('priceTV');
    return { name, unitPriceCents: usdToCents(await this.ui.element('priceTV').getText()) };
  }
  async setQuantity(quantity: number): Promise<void> {
    if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > 99) throw new Error('Cantidad fuera de rango.');
    await this.ui.show('noTV');
    let current = Number(await this.ui.element('noTV').getText());
    if (!Number.isSafeInteger(current) || current < 0 || current > 99) throw new Error('Control de cantidad inválido.');
    while (current !== quantity) {
      const delta = quantity > current ? 1 : -1;
      await this.ui.show(delta > 0 ? 'plusIV' : 'minusIV');
      const control = await this.ui.element(delta > 0 ? 'plusIV' : 'minusIV');
      await control.waitForEnabled({timeout: 5000});
      // UiAutomator2 permite pulsar por ID de elemento sin fijar coordenadas del dispositivo.
      await this.ui.driver.execute('mobile: clickGesture', {elementId: control.elementId});
      current += delta;
      await this.ui.driver.waitUntil(async () => (await this.ui.element('noTV').getText()) === String(current), { timeout: 5000 });
    }
  }
  async addToCart(): Promise<void> {
    await this.ui.show('cartBt');
    await this.ui.element('cartBt').waitForEnabled({ timeout: 10000 });
    await this.ui.element('cartBt').click();
  }
}
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
  async removeOnlyItem(): Promise<void> { await this.ui.show('removeBt'); await this.ui.element('removeBt').click(); }
  async emptyStateVisible(): Promise<boolean> { return this.ui.visible('noItemTitleTV'); }
  async totalVisible(): Promise<boolean> { return this.ui.visible('totalPriceTV'); }
}
export class LoginScreen {
  constructor(private readonly ui: NativeUi) {}
  async open(): Promise<void> {
    await this.ui.wait('menuIV'); await this.ui.element('menuIV').click();
    await this.ui.showSelector('new UiSelector().description("Login Menu Item")');
    await this.ui.driver.$('~Login Menu Item').click();
    await this.ui.wait('nameET');
  }
  async submit(username: string, password: string): Promise<void> {
    await this.ui.element('nameET').setValue(username);
    await this.ui.element('passwordET').setValue(password);
    if (await this.ui.driver.isKeyboardShown()) await this.ui.driver.hideKeyboard();
    await this.ui.show('loginBtn'); await this.ui.element('loginBtn').click();
  }
  async errorVisible(): Promise<boolean> { return await this.ui.visible('nameErrorTV') || await this.ui.visible('passwordErrorTV'); }
  async formVisible(): Promise<boolean> { return this.ui.visible('loginBtn'); }
  async readAuthenticationMenu(): Promise<{loginVisible: boolean; logoutVisible: boolean}> {
    await this.ui.element('menuIV').click();
    // El elemento cambia según el estado de autenticación y está al final del menú.
    await this.ui.showSelector(resourceSelector('itemTV') + '.textMatches("Log In|Log Out")');
    return { loginVisible: await this.ui.driver.$('~Login Menu Item').isDisplayed(), logoutVisible: await this.ui.driver.$('~Logout Menu Item').isExisting() };
  }
}
