export interface ProductCase {
  readonly id: string;
  readonly name: string;
  readonly quantity: number;
  readonly unitPriceCents: number;
  readonly totalCents: number;
}
export interface CartSnapshot {
  names: string[];
  quantity: number;
  unitPriceCents: number;
  totalCents: number;
  itemCount: string;
}
export interface Catalog {
  waitForLoaded(): Promise<void>;
  openProduct(name: string): Promise<void>;
}
export interface ProductDetail {
  waitForLoaded(): Promise<void>;
  read(): Promise<{ name: string; unitPriceCents: number }>;
  setQuantity(quantity: number): Promise<void>;
  addToCart(): Promise<void>;
}
export interface Cart {
  waitForLoaded(): Promise<void>;
  read(): Promise<CartSnapshot>;
}
export interface Header {
  openCart(): Promise<void>;
  waitForQuantity(quantity: number): Promise<void>;
}
