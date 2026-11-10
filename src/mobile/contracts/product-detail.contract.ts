import type { ProductColor } from '../models/product-color.js';
import type { Product } from '../models/product.js';
export interface ProductDetail {
  waitForLoaded(): Promise<void>;
  read(): Promise<Product>;
  setQuantity(quantity: number): Promise<void>;
  addButtonEnabled(): Promise<boolean>;
  selectColor(color: ProductColor): Promise<void>;
  colorSelected(color: ProductColor): Promise<boolean>;
  colorSwatch(color: ProductColor): Promise<Buffer>;
  productImage(): Promise<Buffer>;
  openReview(rating: number): Promise<void>;
  addToCart(): Promise<void>;
}
