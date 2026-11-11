import { test, expect } from '../fixtures/native.fixture.js';
import { syntheticProductCases } from '../data/product-case.factory.js';
const seed = process.env.MOBILE_DATA_SEED || 'assessment-2.3.0';
const count = Number(process.env.MOBILE_SAMPLE_SIZE || 3);
for (const data of syntheticProductCases(seed, count)) {
  test('GEN-01 ' + data.id + ' | Comprar ' + data.quantity + (data.quantity === 1 ? ' unidad de ' : ' unidades de ') + data.name, {tag: ['@mobile', '@exploratory', '@random']}, async ({app, step}, info) => {
    await info.attach('Datos sintéticos reproducibles', {body: JSON.stringify({seed, count, data}), contentType: 'application/json'});
    await step('Dado que la semilla fija un producto real y una cantidad antes de interactuar', async () => {
      await app.catalog.findProduct(data.name);
      await app.shopping.selectProduct(data);
      expect(await app.detail.read()).toEqual({name: data.name, unitPriceCents: data.unitPriceCents});
    });
    await step('Cuando agrego la cantidad generada al carrito', () => app.shopping.addSelectedProduct(data));
    await step('Entonces el carrito conserva la selección y calcula su importe', async () => {
      await app.cart.waitForLoaded();
      expect(await app.cart.read()).toEqual({names: [data.name], quantity: data.quantity, unitPriceCents: data.unitPriceCents, totalCents: data.totalCents, itemCount: data.quantity + ' Items'});
    });
  });
}
