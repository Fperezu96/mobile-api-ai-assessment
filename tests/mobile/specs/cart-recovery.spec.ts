import { test, expect } from '../fixtures/native.fixture.js';
import { cartCases } from '../data/cart-cases.js';

test('CART-03 | Volver a comprar después de vaciar el carrito conserva solo la nueva cantidad',
  {tag: ['@mobile', '@interview', '@cart']}, async ({app, step}, info) => {
    const initial = cartCases[0];
    const repeated = cartCases[1];
    const initialTotalCents = initial.unitPriceCents * initial.quantity;
    const repeatedTotalCents = repeated.unitPriceCents * repeated.quantity;

    await info.attach('Expectativas previas', {
      body: JSON.stringify({initial: {...initial, totalCents: initialTotalCents},
        repeated: {...repeated, totalCents: repeatedTotalCents}}),
      contentType: 'application/json',
    });

    await step('Dado que Backpack muestra el nombre y precio unitario esperados', async () => {
      await app.shopping.selectProduct(initial);
      expect(await app.detail.read()).toEqual({name: initial.name, unitPriceCents: initial.unitPriceCents});
    });
    await step('Cuando agrego una unidad, el carrito refleja esa compra', async () => {
      await app.shopping.addSelectedProduct(initial);
      await app.cart.waitForLoaded();
      expect(await app.cart.read()).toEqual({names: [initial.name], quantity: initial.quantity,
        unitPriceCents: initial.unitPriceCents, totalCents: initialTotalCents, itemCount: '1 Items'});
    });
    await step('Y elimino el único producto del carrito', () => app.cart.removeOnlyItem());
    await step('Entonces el carrito queda vacío y deja de mostrar el total anterior', async () => {
      // Conservar el criterio funcional pese al bloqueo de cinco segundos conocido en la demo.
      await expect.poll(() => app.cart.emptyStateVisible(), {
        timeout: 10000, message: 'El carrito debe quedar vacío después de eliminar Backpack.',
      }).toBe(true);
      expect(await app.cart.totalVisible()).toBe(false);
    });
    await step('Cuando regreso al catálogo y selecciono nuevamente Backpack', async () => {
      await app.driver.back();
      await app.detail.waitForLoaded();
      expect((await app.detail.read()).name).toBe(initial.name);
      await app.driver.back();
      await app.catalog.waitForLoaded();
      await app.shopping.selectProduct(repeated);
      expect(await app.detail.read()).toEqual({name: repeated.name, unitPriceCents: repeated.unitPriceCents});
    });
    await step('Y agrego dos unidades del mismo producto', () => app.shopping.addSelectedProduct(repeated));
    await step('Entonces el carrito contiene solo las dos unidades y el importe de la nueva compra', async () => {
      await app.cart.waitForLoaded();
      expect(await app.cart.read()).toEqual({names: [repeated.name], quantity: repeated.quantity,
        unitPriceCents: repeated.unitPriceCents, totalCents: repeatedTotalCents, itemCount: '2 Items'});
    });
  });
