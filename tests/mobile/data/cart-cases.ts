import type { ProductCase } from '../../../src/mobile/contracts/shop.contracts.js';
// Expectativas fijadas antes de ejecutar, contrastadas con la fuente 2.3.0 de la demo.
export const cartCases: readonly ProductCase[] = [
  { id: 'D1', name: 'Sauce Labs Backpack', quantity: 1, unitPriceCents: 2999, totalCents: 2999 },
  { id: 'D2', name: 'Sauce Labs Backpack', quantity: 2, unitPriceCents: 2999, totalCents: 5998 },
];
