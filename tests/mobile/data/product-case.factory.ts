import { createHash } from 'node:crypto';
import type { ProductCase } from '../../../src/mobile/models/product-case.js';
import type { Product } from '../../../src/mobile/models/product.js';
import { catalogProducts } from './catalog-products.js';
export function productCase(product: Product, quantity: number, id: string): ProductCase {
  if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > 10) throw new Error('Cantidad sintética fuera del rango de exploración 1..10.');
  return {...product, id, quantity, totalCents: quantity * product.unitPriceCents};
}
export function syntheticProductCases(seed: string, count: number): readonly ProductCase[] {
  if (!seed.trim() || !Number.isSafeInteger(count) || count < 1 || count > catalogProducts.length) throw new Error('Semilla o tamaño de muestra inválidos.');
  let state = createHash('sha256').update(seed).digest().readUInt32LE(0);
  // PRNG con semilla para repetir exactamente la selección, sin reemplazo.
  const random = () => {
    state += 0x6D2B79F5;
    let value = state;
    value = Math.imul(value ^ value >>> 15, value | 1);
    value ^= value + Math.imul(value ^ value >>> 7, value | 61);
    return ((value ^ value >>> 14) >>> 0) / 4294967296;
  };
  const pool = [...catalogProducts];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count).map((product, index) => productCase(product, 1 + Math.floor(random() * 3), 'R' + (index + 1)));
}
