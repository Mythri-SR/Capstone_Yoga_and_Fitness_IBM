import { test, expect } from '@playwright/test';
import { loadTestData } from '../utils/config.js';
import { LoginPage } from '../pages/LoginPage.js';

const data = loadTestData();

test.describe('Module 8 — Progress tracking (15 scenarios)', () => {
  test('M8-TC01: Guest sees dashboard CTA', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByTestId('dashboard-guest')).toBeVisible();
  });

  test('M8-TC02: Member stats render numeric tiles', async ({ page }) => {
    const lp = new LoginPage(page);
    await lp.login(data.member.email, data.member.password);
    await page.goto('/dashboard');
    await expect(page.getByTestId('stat-workouts')).toBeVisible();
    await expect(page.getByTestId('stat-calories')).toBeVisible();
    await expect(page.getByTestId('stat-attendance')).toBeVisible();
    await expect(page.getByTestId('stat-streak')).toBeVisible();
  });

  test('M8-TC03: Logging workout shows confirmation banner', async ({ page }) => {
    const lp = new LoginPage(page);
    await lp.login(data.member.email, data.member.password);
    await page.goto('/dashboard');
    await page.getByTestId('dashboard-calories-input').fill('210');
    await page.getByTestId('dashboard-log-submit').click();
    await expect(page.getByTestId('dashboard-message')).toContainText(/progress/i, { timeout: 15_000 });
  });

  test('M8-TC04: Calories boundary accepts zero', async ({ page }) => {
    const lp = new LoginPage(page);
    await lp.login(data.member.email, data.member.password);
    await page.goto('/dashboard');
    await page.getByTestId('dashboard-calories-input').fill('0');
    await page.getByTestId('dashboard-log-submit').click();
    await expect(page.getByTestId('dashboard-error')).toHaveCount(0);
  });

  test('M8-TC05: Large calorie entries are accepted within range', async ({ page }) => {
    const lp = new LoginPage(page);
    await lp.login(data.member.email, data.member.password);
    await page.goto('/dashboard');
    await page.getByTestId('dashboard-calories-input').fill('9500');
    await page.getByTestId('dashboard-log-submit').click();
    await expect(page.getByTestId('dashboard-message')).toBeVisible({ timeout: 15_000 });
  });

  test('M8-TC06: Dashboard loads without fatal error', async ({ page }) => {
    const lp = new LoginPage(page);
    await lp.login(data.member.email, data.member.password);
    await page.goto('/dashboard');
    await expect(page.getByTestId('dashboard-page')).toBeVisible();
  });

  test('M8-TC07: Progress nav link reachable', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('nav-login').click();
    const lp = new LoginPage(page);
    await lp.login(data.member.email, data.member.password);
    await page.getByTestId('nav-dashboard').click();
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test('M8-TC08: Stats numbers are non-negative strings in UI', async ({ page }) => {
    const lp = new LoginPage(page);
    await lp.login(data.member.email, data.member.password);
    await page.goto('/dashboard');
    const txt = await page.getByTestId('stat-workouts').locator('strong').innerText();
    expect(Number.isNaN(Number(txt))).toBe(false);
    expect(Number(txt)).toBeGreaterThanOrEqual(0);
  });

  test('M8-TC09: Log form remains mounted after submit', async ({ page }) => {
    const lp = new LoginPage(page);
    await lp.login(data.member.email, data.member.password);
    await page.goto('/dashboard');
    await page.getByTestId('dashboard-log-submit').click();
    await expect(page.getByTestId('dashboard-log-form')).toBeVisible();
  });

  test('M8-TC10: Trainer dashboard also surfaces stats shell', async ({ page }) => {
    const lp = new LoginPage(page);
    await lp.login(data.trainer.email, data.trainer.password);
    await page.goto('/dashboard');
    await expect(page.getByTestId('stat-streak')).toBeVisible();
  });

  test('M8-TC11: Hero copy explains metrics', async ({ page }) => {
    const lp = new LoginPage(page);
    await lp.login(data.member.email, data.member.password);
    await page.goto('/dashboard');
    await expect(page.getByTestId('dashboard-page')).toContainText(/workouts/i);
  });

  test('M8-TC12: Calories field defaults to numeric entry', async ({ page }) => {
    const lp = new LoginPage(page);
    await lp.login(data.member.email, data.member.password);
    await page.goto('/dashboard');
    await expect(page.getByTestId('dashboard-calories-input')).toHaveAttribute('type', 'number');
  });

  test('M8-TC13: Dashboard accessible post refresh', async ({ page }) => {
    const lp = new LoginPage(page);
    await lp.login(data.member.email, data.member.password);
    await page.goto('/dashboard');
    await expect(page.getByTestId('dashboard-stats')).toBeVisible();
    const progressReload = page.waitForResponse(
      (r) => r.request().method() === 'GET' && r.url().includes('/api/progress') && r.ok(),
      { timeout: 30_000 }
    );
    await page.reload({ waitUntil: 'load' });
    await progressReload;
    await expect(page.getByTestId('dashboard-stats')).toBeVisible({ timeout: 15_000 });
  });

  test('M8-TC14: Attendance tile mirrors label', async ({ page }) => {
    const lp = new LoginPage(page);
    await lp.login(data.member.email, data.member.password);
    await page.goto('/dashboard');
    await expect(page.getByTestId('stat-attendance')).toContainText(/attendance/i);
  });

  test('M8-TC15: Streak tile highlights consistency metric', async ({ page }) => {
    const lp = new LoginPage(page);
    await lp.login(data.member.email, data.member.password);
    await page.goto('/dashboard');
    await expect(page.getByTestId('stat-streak')).toContainText(/streak/i);
  });
});
