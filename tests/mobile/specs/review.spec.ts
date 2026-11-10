import { test, expect } from '../fixtures/native.fixture.js';
import { cartCases } from '../data/cart-cases.js';

for (const rating of [1, 5]) {
  test('REVIEW-01 | Valorar el producto con ' + rating + (rating === 1 ? ' estrella' : ' estrellas') + ' muestra la confirmación y permite continuar', {tag: ['@mobile', '@regression', '@review', '@boundary']}, async ({app, step}, info) => {
    const data = cartCases[0];
    await info.attach('Expectativa de valoración', {body: JSON.stringify({rating, message: 'Thank you for submitting your review!', source: 'dialog_review.xml y Methods.showReviewDialog de 2.3.0'}), contentType: 'application/json'});
    await step('Dado que estoy consultando el detalle del producto', () => app.shopping.selectProduct(data));
    await step('Cuando selecciono una valoración de ' + rating + (rating === 1 ? ' estrella' : ' estrellas') + '', () => app.detail.openReview(rating));
    await step('Entonces la app confirma la recepción de la valoración', async current => {
      await app.review.waitForOpen();
      expect(await app.review.message()).toBe('Thank you for submitting your review!');
      await current.attach('Confirmación de reseña', {body: Buffer.from(await app.driver.takeScreenshot(), 'base64'), contentType: 'image/png'});
    });
    await step('Y al continuar regreso al mismo producto sin agregarlo al carrito', async () => {
      await app.review.continueShopping();
      expect(await app.review.visible()).toBe(false);
      await app.detail.waitForLoaded();
      expect(await app.detail.read()).toEqual({name: data.name, unitPriceCents: data.unitPriceCents});
      await app.header.openCart();
      await expect.poll(() => app.cart.emptyStateVisible()).toBe(true);
    });
    info.annotations.push({type: 'alcance', description: 'Se verifica confirmación UI y continuidad. No existe evidencia de persistencia de reseñas o envío a un backend.'});
  });
}
