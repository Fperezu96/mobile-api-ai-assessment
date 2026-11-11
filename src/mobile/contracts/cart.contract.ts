import type { CartSnapshot } from '../models/cart-snapshot.js';
export interface Cart {
  waitForLoaded(): Promise<void>;
  setQuantity(quantity: number): Promise<void>;
  decreaseOnlyItem(): Promise<void>;
  colorSwatch(): Promise<Buffer>;
  tapColorSwatch(): Promise<void>;
  removeOnlyItem(): Promise<void>;
  emptyStateVisible(): Promise<boolean>;
  totalVisible(): Promise<boolean>;
  read(): Promise<CartSnapshot>;
}
