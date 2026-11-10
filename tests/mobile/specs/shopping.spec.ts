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

test('MOB-02 | Una contraseña incorrecta impide iniciar sesión', {tag: ['@mobile', '@regression', '@negative', '@known-issue', '@login']}, async ({app, step}, info) => {
  await step('Dado que el formulario permite ingresar credenciales', () => app.login.open());
  await step('Cuando intento ingresar con una contraseña incorrecta', async () => {
    await app.login.submit('bob@example.com', 'incorrecta-qa-2026');
  });
  await step('Entonces veo el rechazo y permanezco en el formulario', async () => {
    await expect.configure({soft: true}).poll(() => app.login.errorVisible(), {timeout: 10000, message: 'Las credenciales inválidas deben mostrar un rechazo visible.'}).toBe(true);
    expect.soft(await app.login.formVisible()).toBe(true);
    await info.attach('Formulario tras el intento', {body: JSON.stringify({visible: await app.login.formVisible()}), contentType: 'application/json'});
  });
  await step('Y el menú confirma que no se habilitó una sesión válida', async () => {
    expect.soft(await app.login.readAuthenticationMenu()).toEqual({loginVisible: true, logoutVisible: false});
  });
});

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

test('MOB-04 | Eliminar el único producto deja el carrito vacío', {tag: ['@mobile', '@regression', '@cart']}, async ({app, step}) => {
  const data = cartCases[0];
  await step('Dado que el carrito contiene un único producto', async () => {
    await app.shopping.selectProduct(data); await app.shopping.addSelectedProduct(data);
    await app.cart.waitForLoaded();
    expect((await app.cart.read()).names).toEqual([data.name]);
  });
  await step('Cuando elimino ese producto', () => app.cart.removeOnlyItem());
  await step('Entonces el carrito muestra su estado vacío sin un total anterior', async () => {
    await expect.poll(() => app.cart.emptyStateVisible()).toBe(true);
    expect(await app.cart.totalVisible()).toBe(false);
  });
});

for (const product of [
  {name: 'Sauce Labs Bike Light', unitPriceCents: 999},
  {name: 'Sauce Labs Backpack (green)', unitPriceCents: 2999},
]) {
  test('MOB-05 | Abrir ' + product.name + ' muestra su detalle sin cerrar la app', {tag: ['@mobile', '@regression', '@known-issue']}, async ({app, step}) => {
    await step('Cuando abro la imagen del producto en el catálogo', async () => {
      await app.catalog.openProduct(product.name);
    });
    await step('Entonces la app permanece abierta y muestra el detalle correcto', async () => {
      await app.detail.waitForLoaded();
      expect(await app.detail.read()).toEqual({name: product.name, unitPriceCents: product.unitPriceCents});
    });
  });
}

test('MOB-06 | Un usuario vacío impide enviar el inicio de sesión', {tag: ['@mobile', '@smoke', '@regression', '@negative', '@login']}, async ({app, step}) => {
  await step('Cuando envío el formulario sin completar el usuario', async () => {
    await app.login.open();
    await app.login.submit('', 'dato-de-prueba');
  });
  await step('Entonces el formulario muestra la validación y permanece disponible', async () => {
    await expect.poll(() => app.login.errorVisible()).toBe(true);
    expect(await app.login.formVisible()).toBe(true);
  });
  await step('Y el menú conserva el estado de usuario sin autenticar', async () => {
    expect(await app.login.readAuthenticationMenu()).toEqual({loginVisible: true, logoutVisible: false});
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
