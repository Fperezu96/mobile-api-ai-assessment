import { productByName } from './catalog-products.js';
import { productCase } from './product-case.factory.js';
// Dos datos estables para el mínimo del reto; la exploración aleatoria se ejecuta por separado.
export const cartCases = [
  productCase(productByName('Sauce Labs Backpack'), 1, 'D1'),
  productCase(productByName('Sauce Labs Backpack'), 2, 'D2'),
] as const;
