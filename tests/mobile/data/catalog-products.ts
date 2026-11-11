import type { Product } from '../../../src/mobile/models/product.js';
// Catálogo de referencia fijado desde BaseActivity de la versión 2.3.0; nunca desde el resultado del test.
export const catalogProducts: readonly Product[] = Object.freeze([
  {name: 'Sauce Labs Backpack', unitPriceCents: 2999},
  ...['green', 'orange', 'red', 'violet', 'yellow'].map(color => ({name: 'Sauce Labs Backpack (' + color + ')', unitPriceCents: 2999})),
  {name: 'Sauce Labs Bike Light', unitPriceCents: 999},
  {name: 'Sauce Labs Bolt T-Shirt', unitPriceCents: 1599},
  ...['blue', 'green', 'red', 'yellow'].map(color => ({name: 'Sauce Labs Bolt T-Shirt (' + color + ')', unitPriceCents: 1599})),
  {name: 'Sauce Labs Fleece Jacket', unitPriceCents: 4999},
  ...['blue', 'brown', 'green', 'pink', 'red'].map(color => ({name: 'Sauce Labs Fleece Jacket (' + color + ')', unitPriceCents: 4999})),
  {name: 'Sauce Labs Onesie', unitPriceCents: 799},
  {name: 'Test.allTheThings() T-Shirt', unitPriceCents: 1599},
  ...['turquoise', 'pink', 'purple', 'yellow'].map(color => ({name: 'Test.allTheThings() T-Shirt (' + color + ')', unitPriceCents: 1599})),
]);
export function productByName(name: string): Product {
  const product = catalogProducts.find(item => item.name === name);
  if (!product) throw new Error('El producto no pertenece al catálogo de referencia: ' + name);
  return product;
}
