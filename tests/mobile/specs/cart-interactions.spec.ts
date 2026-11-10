import { test, expect } from '../fixtures/native.fixture.js';
import { cartCases } from '../data/cart-cases.js';
import { centerColor } from '../../../src/mobile/support/image-observation.js';
import type { ProductColor } from '../../../src/mobile/models/product-color.js';

test('CART-01 | Cambiar la cantidad en el carrito recalcula el importe y permite reducir unidades', {tag: ['@mobile', '@regression', '@cart', '@quantity']}, async ({app, step}) => {
  const data = cartCases[0];
  await step('Dado que el carrito contiene una unidad con precio conocido', async () => {
    await app.shopping.selectProduct(data);
    await app.shopping.addSelectedProduct(data);
    await app.cart.waitForLoaded();
    expect((await app.cart.read()).totalCents).toBe(data.unitPriceCents);
  });
  await step('Cuando aumento la cantidad a tres unidades', () => app.cart.setQuantity(3));
  await step('Entonces el carrito muestra tres unidades y el total calculado con el precio original', async () => {
    expect(await app.cart.read()).toEqual({names: [data.name], quantity: 3, unitPriceCents: data.unitPriceCents, totalCents: data.unitPriceCents * 3, itemCount: '3 Items'});
  });
  await step('Y al reducir a una unidad se recupera el importe original', async () => {
    await app.cart.setQuantity(1);
    expect(await app.cart.read()).toEqual({names: [data.name], quantity: 1, unitPriceCents: data.unitPriceCents, totalCents: data.unitPriceCents, itemCount: '1 Items'});
  });
});

test('CART-02 | Reducir la última unidad retira el producto del carrito', {tag: ['@mobile', '@regression', '@cart', '@boundary']}, async ({app, step}) => {
  const data = cartCases[0];
  await step('Dado que queda una sola unidad en el carrito', async () => {
    await app.shopping.selectProduct(data);
    await app.shopping.addSelectedProduct(data);
    await app.cart.waitForLoaded();
    expect((await app.cart.read()).quantity).toBe(1);
  });
  await step('Cuando disminuyo la última unidad', () => app.cart.decreaseOnlyItem());
  await step('Entonces el carrito queda vacío y deja de mostrar el importe anterior', async () => {
    await expect.poll(() => app.cart.emptyStateVisible()).toBe(true);
    expect(await app.cart.totalVisible()).toBe(false);
  });
});

test('DETAIL-01 | Una cantidad cero impide agregar el producto y permite volver a una cantidad válida', {tag: ['@mobile', '@regression', '@negative', '@boundary', '@quantity']}, async ({app, step}) => {
  const data = cartCases[0];
  await step('Dado que estoy en el detalle de un producto disponible', () => app.shopping.selectProduct(data));
  await step('Cuando reduzco la cantidad a cero', () => app.detail.setQuantity(0));
  await step('Entonces la acción de agregar al carrito queda deshabilitada', async () => {
    expect(await app.detail.addButtonEnabled()).toBe(false);
  });
  await step('Y puedo recuperar una cantidad válida sin haber agregado productos', async () => {
    await app.detail.setQuantity(1);
    expect(await app.detail.addButtonEnabled()).toBe(true);
    await app.header.openCart();
    await expect.poll(() => app.cart.emptyStateVisible()).toBe(true);
  });
});

for (const color of ['Blue', 'Green'] satisfies ProductColor[]) {
  test('COLOR-01 | El carrito conserva la variante ' + color + ' elegida en el detalle', {tag: ['@mobile', '@regression', '@cart', '@color']}, async ({app, step}, info) => {
    const data = cartCases[0];
    let expectedSwatch: Buffer;
    await step('Dado que el detalle permite elegir la variante de color', async () => {
      await app.shopping.selectProduct(data);
      await info.attach('Imagen antes de elegir color', {body: await app.detail.productImage(), contentType: 'image/png'});
      expectedSwatch = await app.detail.colorSwatch(color);
      await info.attach('Muestra de color esperada', {body: expectedSwatch, contentType: 'image/png'});
    });
    await step('Cuando selecciono el color ' + color + ' y agrego el producto', async () => {
      await app.detail.selectColor(color);
      expect(await app.detail.colorSelected(color)).toBe(true);
      await info.attach('Imagen después de elegir color', {body: await app.detail.productImage(), contentType: 'image/png'});
      await app.shopping.addSelectedProduct(data);
    });
    await step('Entonces el carrito conserva el color, el producto y sus importes', async () => {
      await app.cart.waitForLoaded();
      const actualSwatch = await app.cart.colorSwatch();
      await info.attach('Muestra de color en carrito', {body: actualSwatch, contentType: 'image/png'});
      expect(centerColor(actualSwatch), 'El indicador del carrito debe conservar el color elegido').toEqual(centerColor(expectedSwatch));
      expect(await app.cart.read()).toEqual({names: [data.name], quantity: 1, unitPriceCents: data.unitPriceCents, totalCents: data.totalCents, itemCount: '1 Items'});
    });
    info.annotations.push({type: 'regla-visual-pendiente', description: 'Se adjuntan ambas imágenes. No se exige cambiar la fotografía sin un requisito confirmado; el color seleccionado sí debe transferirse al carrito.'});
  });
}

test('COLOR-02 | El indicador de color del carrito se comporta como información sin modificar la compra', {tag: ['@mobile', '@regression', '@color', '@characterization']}, async ({app, step}, info) => {
  const data = cartCases[0];
  info.annotations.push({type: 'caracterización', description: 'El indicador no ofrece edición en la implementación 2.3.0; no se presenta como regla de negocio del evaluador.'});
  await step('Dado que el carrito contiene un producto con su color seleccionado', async () => {
    await app.shopping.selectProduct(data);
    await app.shopping.addSelectedProduct(data);
    await app.cart.waitForLoaded();
  });
  const before = await app.cart.read();
  const swatch = centerColor(await app.cart.colorSwatch());
  await step('Cuando pulso el indicador de color dentro del carrito', () => app.cart.tapColorSwatch());
  await step('Entonces permanezco en el carrito con los mismos datos y color', async () => {
    await app.cart.waitForLoaded();
    expect(await app.cart.read()).toEqual(before);
    expect(centerColor(await app.cart.colorSwatch())).toEqual(swatch);
  });
});
