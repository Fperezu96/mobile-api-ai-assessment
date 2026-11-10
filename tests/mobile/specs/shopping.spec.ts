import { test, expect } from '../fixtures/native.fixture.js';
import { cartCases } from '../data/cart-cases.js';

for (const data of cartCases) {
  test('MOB-01 ' + data.id + ' | El carrito conserva ' + data.quantity + (data.quantity === 1 ? ' unidad de ' : ' unidades de ') + data.name,
    {tag: ['@smoke', '@regression', '@cart']}, async ({app}, info) => {
      await info.attach('Expectativas previas', {body: JSON.stringify(data), contentType: 'application/json'});
      await test.step('Elegir el producto y comprobar su precio antes de agregarlo', async () => {
        await app.shopping.selectProduct(data);
        expect(await app.detail.read()).toEqual({name: data.name, unitPriceCents: data.unitPriceCents});
      });
      await test.step('Agregar la cantidad elegida y abrir el carrito', () => app.shopping.addSelectedProduct(data));
      await test.step('Comprobar producto, cantidad, precio unitario y total', async () => {
        await app.cart.waitForLoaded();
        const cart = await app.cart.read();
        expect(cart).toEqual({names: [data.name], quantity: data.quantity, unitPriceCents: data.unitPriceCents, totalCents: data.totalCents, itemCount: data.quantity + ' Items'});
        expect(cart.totalCents).toBe(data.quantity * data.unitPriceCents);
      });
    });
}

test('MOB-02 | Una contraseña incorrecta impide iniciar sesión', {tag: ['@regression', '@login']}, async ({app}, info) => {
  await test.step('Abrir el formulario de inicio de sesión', () => app.login.open());
  await test.step('Intentar ingresar con una contraseña diferente de la publicada para la demo', async () => {
    await app.login.submit('bob@example.com', 'incorrecta-qa-2026');
  });
  await test.step('Comprobar el rechazo y la permanencia del formulario', async () => {
    await expect.configure({soft: true}).poll(() => app.login.errorVisible(), {timeout: 10000, message: 'Las credenciales inválidas deben mostrar un rechazo visible.'}).toBe(true);
    expect.soft(await app.login.formVisible()).toBe(true);
    await info.attach('Formulario tras el intento', {body: JSON.stringify({visible: await app.login.formVisible()}), contentType: 'application/json'});
  });
  await test.step('Confirmar que el menú sigue ofreciendo iniciar sesión', async () => {
    expect.soft(await app.login.readAuthenticationMenu()).toEqual({loginVisible: true, logoutVisible: false});
  });
});

test('MOB-03 | Volver al catálogo conserva el contenido del carrito', {tag: ['@regression', '@navigation']}, async ({app}) => {
  const data = cartCases[0];
  await test.step('Preparar un carrito y comprobar su contenido inicial', async () => {
    await app.shopping.selectProduct(data);
    await app.shopping.addSelectedProduct(data);
    await app.cart.waitForLoaded();
    expect((await app.cart.read()).totalCents).toBe(data.totalCents);
  });
  await test.step('Regresar con la acción del sistema al detalle y al catálogo', async () => {
    await app.driver.back();
    await app.detail.waitForLoaded();
    expect((await app.detail.read()).name).toBe(data.name);
    await app.driver.back();
    await app.catalog.waitForLoaded();
  });
  await test.step('Abrir de nuevo el carrito y comprobar que conserva los datos', async () => {
    await app.header.openCart();
    await app.cart.waitForLoaded();
    const cart = await app.cart.read();
    expect(cart.names).toEqual([data.name]);
    expect(cart.quantity).toBe(data.quantity);
    expect(cart.unitPriceCents).toBe(data.unitPriceCents);
    expect(cart.totalCents).toBe(data.totalCents);
  });
});

test('MOB-04 | Eliminar el único producto deja el carrito vacío', {tag: ['@regression', '@cart']}, async ({app}) => {
  const data = cartCases[0];
  await test.step('Agregar un producto y comprobar que aparece en el carrito', async () => {
    await app.shopping.selectProduct(data); await app.shopping.addSelectedProduct(data);
    await app.cart.waitForLoaded();
    expect((await app.cart.read()).names).toEqual([data.name]);
  });
  await test.step('Eliminar el producto del carrito', () => app.cart.removeOnlyItem());
  await test.step('Comprobar el estado vacío y la ausencia de productos anteriores', async () => {
    await expect.poll(() => app.cart.emptyStateVisible()).toBe(true);
    expect(await app.cart.totalVisible()).toBe(false);
  });
});

for (const product of [
  {name: 'Sauce Labs Bike Light', unitPriceCents: 999},
  {name: 'Sauce Labs Backpack (green)', unitPriceCents: 2999},
]) {
  test('MOB-05 | Abrir ' + product.name + ' muestra su detalle sin cerrar la app', {tag: ['@regression', '@known-issue']}, async ({app}) => {
    await test.step('Localizar el producto en el catálogo y abrir su imagen', async () => {
      await app.catalog.openProduct(product.name);
    });
    await test.step('Comprobar que el detalle pertenece al producto elegido', async () => {
      await app.detail.waitForLoaded();
      expect(await app.detail.read()).toEqual({name: product.name, unitPriceCents: product.unitPriceCents});
    });
  });
}

test('MOB-06 | Un usuario vacío impide enviar el inicio de sesión', {tag: ['@regression', '@login']}, async ({app}) => {
  await test.step('Intentar iniciar sesión sin completar el usuario', async () => {
    await app.login.open();
    await app.login.submit('', 'dato-de-prueba');
  });
  await test.step('Comprobar el mensaje de validación y el formulario visible', async () => {
    await expect.poll(() => app.login.errorVisible()).toBe(true);
    expect(await app.login.formVisible()).toBe(true);
  });
  await test.step('Confirmar que no se habilitó una sesión válida', async () => {
    expect(await app.login.readAuthenticationMenu()).toEqual({loginVisible: true, logoutVisible: false});
  });
});
