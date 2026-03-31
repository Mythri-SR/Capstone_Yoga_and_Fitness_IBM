import { BasePage } from './BasePage.js';

export class BookPage extends BasePage {
  constructor(page) {
    super(page);
    this.programSelect = page.getByTestId('book-program-select');
    this.slotList = page.getByTestId('book-slot-list');
    this.loginHint = page.getByTestId('book-login-hint');
    this.success = page.getByTestId('book-success');
    this.error = page.getByTestId('book-error');
  }

  async selectProgramByValue(programId) {
    await this.programSelect.selectOption(String(programId));
  }

  slotButton(slotId) {
    return this.page.getByTestId(`book-slot-${slotId}`);
  }
}
