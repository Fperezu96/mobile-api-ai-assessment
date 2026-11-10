import type { ReviewDialog } from '../../contracts/review-dialog.contract.js';
import { NativeUi } from '../../support/native-ui.js';
export class ReviewDialogComponent implements ReviewDialog {
  constructor(private readonly ui: NativeUi) {}
  async waitForOpen(): Promise<void> { await this.ui.wait('closeBt'); await this.ui.wait('sortTV'); }
  async message(): Promise<string> { return this.ui.element('sortTV').getText(); }
  async continueShopping(): Promise<void> {
    await this.ui.tap('closeBt');
    await this.ui.driver.waitUntil(async () => !(await this.visible()), {timeout: 5000, timeoutMsg: 'La confirmación de reseña no se cerró.'});
  }
  async visible(): Promise<boolean> { return this.ui.visible('closeBt'); }
}
