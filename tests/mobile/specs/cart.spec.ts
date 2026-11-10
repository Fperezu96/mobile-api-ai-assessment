import { test, expect } from '../fixtures/native.fixture.js';
import { cartCases } from '../data/cart-cases.js';
for (const data of cartCases) {
  test('MOB-01 ' + data.id + ' | El carrito conserva ' + data.quantity + (data.quantity === 1 ? ' unidad de ' : ' unidades de ') + data.name,
    {tag: ['@mobile', '@smoke', '@regression', '@cart']}, async ({app, step}, info) => {
      await info.attach('Expectativas previas', {body: JSON.stringify(data), contentType: 'application/json'});
      await step('Dado que el producto elegido muestra el precio esperado', async () => {
        await app.shopping.selectProduct(data);
        expect(await app.detail.read()).toEqual({name: data.name, unitPriceCents: data.unitPriceCents});
      });
      await step('Cuando agrego la cantidad indicada y abro el carrito', () => app.shopping.addSelectedProduct(data));
      await step('Entonces el carrito conserva el producto, su cantidad y los importes esperados', async () => {
        await app.cart.waitForLoaded();
        const cart = await app.cart.read();
        expect(cart, 'El carrito debe coincidir con el producto, cantidad, precio unitario y total definidos antes de ejecutar').toEqual({names: [data.name], quantity: data.quantity, unitPriceCents: data.unitPriceCents, totalCents: data.totalCents, itemCount: data.quantity + ' Items'});
        expect(cart.totalCents).toBe(data.quantity * data.unitPriceCents);
      });
    });
}

test('MOB-04 | Eliminar el único producto deja el carrito vacío', {tag: ['@mobile', '@regression', '@cart']}, async ({app, step}) => {
  const data = cartCases[0];
  await step('Dado que el carrito contiene un único producto', async () => {
    await app.shopping.selectProduct(data); await app.shopping.addSelectedProduct(data);
    await app.cart.waitForLoaded();
    expect((await app.cart.read()).names).toEqual([data.name]);
  });
  await step('Cuando elimino ese producto', () => app.cart.removeOnlyItem());
  await step('Entonces el carrito muestra su estado vacío sin un total anterior', async () => {
    // La demo bloquea deliberadamente el hilo UI durante 5 s al eliminar.
    await expect.poll(() => app.cart.emptyStateVisible(), {timeout: 10000, message: 'Tras eliminar, el carrito debe mostrar su estado vacío.'}).toBe(true);
    expect(await app.cart.totalVisible()).toBe(false);
  });
});
