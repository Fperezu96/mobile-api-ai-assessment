import { test, expect } from '../fixtures/native.fixture.js';
import { catalogProducts } from '../data/catalog-products.js';
for (const product of catalogProducts) {
  test('CAT-01 | Consultar ' + product.name + ' permite ver su detalle', {tag: ['@mobile', '@regression', '@catalog']}, async ({app, step}, info) => {
    await info.attach('Producto de referencia', {body: JSON.stringify(product), contentType: 'application/json'});
    await step('Dado que el producto forma parte del catálogo publicado', async () => {
      await app.catalog.findProduct(product.name);
      expect(await app.catalog.productVisible(product.name)).toBe(true);
    });
    await step('Cuando selecciono el producto para consultar sus características', () => app.catalog.openProduct(product.name));
    await step('Entonces continúo en la app y veo el nombre y el precio del producto elegido', async () => {
      await app.detail.waitForLoaded();
      expect(await app.detail.read()).toEqual(product);
    });
  });
}
