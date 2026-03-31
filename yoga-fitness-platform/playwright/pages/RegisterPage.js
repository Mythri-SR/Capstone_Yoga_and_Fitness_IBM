import { BasePage } from './BasePage.js';

export class RegisterPage extends BasePage {
  constructor(page) {
    super(page);
    this.name = page.getByTestId('form-register-name');
    this.email = page.getByTestId('form-register-email');
    this.password = page.getByTestId('form-register-password');
    this.role = page.getByTestId('form-register-role');
    this.submit = page.getByTestId('form-register-submit');
    this.error = page.getByTestId('form-register-error');
  }

  async register({ fullName, email, password, role = 'user' }) {
    await this.goto('/register');
    await this.name.fill(fullName);
    await this.email.fill(email);
    await this.password.fill(password);
    await this.role.selectOption(role);
    await this.submit.click();
  }
}
