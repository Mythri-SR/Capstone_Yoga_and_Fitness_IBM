import { BasePage } from './BasePage.js';

export class LoginPage extends BasePage {
  constructor(page) {
    super(page);
    this.email = page.getByTestId('form-login-email');
    this.password = page.getByTestId('form-login-password');
    this.submit = page.getByTestId('form-login-submit');
    this.error = page.getByTestId('form-login-error');
  }

  /**
   * Submits login and waits for the auth round-trip so localStorage/token is set
   * before navigating away (avoids races on /sessions and /trainers/*).
   */
  async login(email, password) {
    await this.goto('/login');
    await this.email.fill(email);
    await this.password.fill(password);
    const [response] = await Promise.all([
      this.page.waitForResponse(
        (r) => r.url().includes('/api/auth/login') && r.request().method() === 'POST',
        { timeout: 20_000 }
      ),
      this.submit.click(),
    ]);
    if (response.ok()) {
      await this.page.waitForURL((u) => !u.pathname.endsWith('/login'), { timeout: 20_000 });
    }
  }
}
