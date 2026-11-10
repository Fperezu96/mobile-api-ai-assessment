import { test, expect } from '../fixtures/native.fixture.js';
test('MOB-02 | Una contraseña incorrecta impide iniciar sesión', {tag: ['@mobile', '@regression', '@negative', '@known-issue', '@login']}, async ({app, step}, info) => {
  await step('Dado que el formulario permite ingresar credenciales', () => app.login.open());
  await step('Cuando intento ingresar con una contraseña incorrecta', async () => {
    await app.login.submit('bob@example.com', 'incorrecta-qa-2026');
  });
  await step('Entonces veo el rechazo de las credenciales', async () => {
    await expect.configure({soft: true}).poll(() => app.login.errorVisible(), {timeout: 10000, message: 'Las credenciales inválidas deben mostrar un rechazo visible.'}).toBe(true);
    await info.attach('Formulario tras el intento', {body: JSON.stringify({visible: await app.login.formVisible()}), contentType: 'application/json'});
  });
  await step('Y el menú confirma que no se habilitó una sesión válida', async () => {
    expect.soft(await app.login.readAuthenticationMenu()).toEqual({loginVisible: true, logoutVisible: false});
  });
});

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
