export interface Catalog {
  waitForLoaded(): Promise<void>;
  productVisible(name: string): Promise<boolean>;
  findProduct(name: string): Promise<void>;
  scrollToProduct(name: string, direction: 'up' | 'down'): Promise<number>;
  openProduct(name: string): Promise<void>;
}
