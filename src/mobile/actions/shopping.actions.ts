import type { Catalog, ProductDetail, Header, ProductCase } from '../contracts/shop.contracts.js';

export class ShoppingActions {
  constructor(private readonly catalog: Catalog, private readonly detail: ProductDetail, private readonly header: Header) {}
  async selectProduct(data: ProductCase): Promise<void> {
    await this.catalog.waitForLoaded();
    await this.catalog.openProduct(data.name);
    await this.detail.waitForLoaded();
  }
  async addSelectedProduct(data: ProductCase): Promise<void> {
    await this.detail.setQuantity(data.quantity);
    await this.detail.addToCart();
    await this.header.waitForQuantity(data.quantity);
    await this.header.openCart();
  }
}
