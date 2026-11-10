import type { Header } from '../../contracts/header.contract.js';
import { NativeUi } from '../../support/native-ui.js';
export class HeaderComponent implements Header {
  constructor(private readonly ui: NativeUi) {}
  async openCart(): Promise<void> { await this.ui.wait('cartRL'); await this.ui.element('cartRL').click(); }
  async waitForQuantity(quantity: number): Promise<void> {
    await this.ui.driver.waitUntil(async () => await this.ui.visible('cartTV') && (await this.ui.element('cartTV').getText()) === String(quantity),
      { timeout: 10000, timeoutMsg: 'El indicador del carrito no muestra la cantidad esperada.' });
  }
}
