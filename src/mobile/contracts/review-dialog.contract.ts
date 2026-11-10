export interface ReviewDialog {
  waitForOpen(): Promise<void>;
  message(): Promise<string>;
  continueShopping(): Promise<void>;
  visible(): Promise<boolean>;
}
