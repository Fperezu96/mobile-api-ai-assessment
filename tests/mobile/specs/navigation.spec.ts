import { test, expect } from '../fixtures/native.fixture.js';
import { cartCases } from '../data/cart-cases.js';
test('MOB-03 | Volver al catálogo conserva el contenido del carrito', {tag: ['@mobile', '@smoke', '@regression', '@native', '@back', '@navigation']}, async ({app, step}) => {
  const data = cartCases[0];
  await step('Dado que el carrito contiene el producto y los importes esperados', async () => {
    await app.shopping.selectProduct(data);
    await app.shopping.addSelectedProduct(data);
    await app.cart.waitForLoaded();
    expect((await app.cart.read()).totalCents).toBe(data.totalCents);
  });
  await step('Cuando uso Back de Android para volver al detalle y después al catálogo', async () => {
    await app.driver.back();
    await app.detail.waitForLoaded();
    expect((await app.detail.read()).name).toBe(data.name);
    await app.driver.back();
    await app.catalog.waitForLoaded();
  });
  await step('Entonces puedo reabrir el carrito sin perder su contenido', async () => {
    await app.header.openCart();
    await app.cart.waitForLoaded();
    const cart = await app.cart.read();
    expect(cart.names).toEqual([data.name]);
    expect(cart.quantity).toBe(data.quantity);
    expect(cart.unitPriceCents).toBe(data.unitPriceCents);
    expect(cart.totalCents).toBe(data.totalCents);
  });
});

test('MOB-07 | El scroll permite localizar un producto sin modificar el carrito', {tag: ['@mobile', '@regression', '@native', '@scroll']}, async ({app, step}) => {
  const target = 'Sauce Labs Bike Light';
  await step('Dado que el catálogo comienza en Backpack y Bike Light aún no es visible', async () => {
    expect(await app.catalog.productVisible('Sauce Labs Backpack')).toBe(true);
    expect(await app.catalog.productVisible(target)).toBe(false);
  });
  await step('Cuando desplazo el catálogo hasta encontrar Bike Light', async current => {
    const gestures = await app.catalog.scrollToProduct(target, 'down');
    expect(gestures, 'Se debe ejecutar al menos un gesto real de scroll').toBeGreaterThan(0);
    await current.attach('Gesto nativo observado', {body: JSON.stringify({command: 'mobile: scrollGesture', direction: 'down', gestures, productVisible: await app.catalog.productVisible(target)}), contentType: 'application/json'});
    await current.attach('Producto localizado', {body: Buffer.from(await app.driver.takeScreenshot(), 'base64'), contentType: 'image/png'});
  });
  await step('Entonces puedo volver al primer producto mediante scroll en sentido contrario', async () => {
    expect(await app.catalog.scrollToProduct('Sauce Labs Backpack', 'up')).toBeGreaterThan(0);
    expect(await app.catalog.productVisible('Sauce Labs Backpack')).toBe(true);
  });
  await step('Y el carrito continúa vacío porque no agregué ningún producto', async () => {
    await app.header.openCart();
    await expect.poll(() => app.cart.emptyStateVisible()).toBe(true);
    expect(await app.cart.totalVisible()).toBe(false);
  });
});
