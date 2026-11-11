export interface Header {
  openCart(): Promise<void>;
  waitForQuantity(quantity: number): Promise<void>;
}
