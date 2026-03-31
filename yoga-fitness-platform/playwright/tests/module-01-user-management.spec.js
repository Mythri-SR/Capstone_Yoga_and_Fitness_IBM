import { test, expect } from '@playwright/test';
import { loadTestData } from '../utils/config.js';
import { LoginPage } from '../pages/LoginPage.js';
import { RegisterPage } from '../pages/RegisterPage.js';

const data = loadTestData();

test.describe('Module 1 — User management (15 scenarios)', () => {
  test('M1-TC01: Home page renders header and hero', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('app-header')).toBeVisible();
    await expect(page.getByTestId('home-hero')).toBeVisible();
  });

  test('M1-TC02: Navigate to login from nav', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('nav-login').click();
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByTestId('login-page')).toBeVisible();
  });

  test('M1-TC03: Login shows error on invalid credentials', async ({ page }) => {
    const lp = new LoginPage(page);
    await lp.goto('/login');
    await lp.email.fill('user1@test.com');
    await lp.password.fill('wrong-password-!!!');
    await lp.submit.click();
    await expect(lp.error).toBeVisible();
  });

  test('M1-TC04: Successful member login lands on dashboard', async ({ page }) => {
    const lp = new LoginPage(page);
    await lp.login(data.member.email, data.member.password);
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test('M1-TC05: Logout clears session UI', async ({ page }) => {
    const lp = new LoginPage(page);
    await lp.login(data.member.email, data.member.password);
    await page.getByTestId('nav-logout').click();
    await expect(page.getByTestId('nav-login')).toBeVisible();
  });

  test('M1-TC06: Register page shows role selector', async ({ page }) => {
    await page.goto('/register');
    await expect(page.getByTestId('form-register-role')).toBeVisible();
  });

  test('M1-TC07: Register rejects password shorter than 8 chars', async ({ page }) => {
    const rp = new RegisterPage(page);
    await rp.goto('/register');
    await rp.name.fill('Short Pass User');
    await rp.email.fill(`short_${Date.now()}@test.com`);
    await rp.password.fill('short');
    await rp.submit.click();
    await expect(rp.page).toHaveURL(/\/register/);
  });

  test('M1-TC08: Register happy path creates member', async ({ page }) => {
    const email = `e2e_${Date.now()}@example.com`;
    const rp = new RegisterPage(page);
    await rp.register({ fullName: 'E2E User', email, password: 'Password9!', role: 'user' });
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test('M1-TC09: Register as trainer exposes trainer-specific flows after login', async ({ page }) => {
    const email = `trainer_e2e_${Date.now()}@example.com`;
    const rp = new RegisterPage(page);
    await rp.register({ fullName: 'E2E Trainer', email, password: 'Password9!', role: 'trainer' });
    await expect(page).toHaveURL(/\/dashboard$/);
    await page.goto('/sessions');
    await expect(page.getByTestId('sessions-page')).toBeVisible();
  });

  test('M1-TC10: Protected dashboard prompts guest to sign in', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByTestId('dashboard-guest')).toBeVisible();
  });

  test('M1-TC11: Trainer login succeeds', async ({ page }) => {
    const lp = new LoginPage(page);
    await lp.login(data.trainer.email, data.trainer.password);
    await expect(page.getByTestId('nav-logout')).toContainText('Maya');
  });

  test('M1-TC12: Login form requires email format', async ({ page }) => {
    await page.goto('/login');
    await page.getByTestId('form-login-email').fill('not-an-email');
    await page.getByTestId('form-login-password').fill('password');
    await page.getByTestId('form-login-submit').click();
    await expect(page).toHaveURL(/\/login/);
  });

  test('M1-TC13: Duplicate email registration shows error', async ({ page }) => {
    const rp = new RegisterPage(page);
    await rp.register({
      fullName: 'Dup',
      email: data.member.email,
      password: 'Password9!',
      role: 'user',
    });
    await expect(rp.error).toBeVisible();
  });

  test('M1-TC14: Admin can sign in from login form', async ({ page }) => {
    const lp = new LoginPage(page);
    await lp.login(data.admin.email, data.admin.password);
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test('M1-TC15: Member sessions page requires authentication state', async ({ page }) => {
    await page.goto('/sessions');
    await expect(page.getByTestId('sessions-guest')).toBeVisible();
  });
});
