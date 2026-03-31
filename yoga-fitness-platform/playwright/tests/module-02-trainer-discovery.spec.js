import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage.js';
import { loadTestData } from '../utils/config.js';

const data = loadTestData();

test.describe('Module 2 — Trainer discovery (15 scenarios)', () => {
  test('M2-TC01: Trainers grid loads cards', async ({ page }) => {
    await page.goto('/trainers');
    await expect(page.getByTestId('trainer-card-list')).toBeVisible();
    await expect(page.getByTestId('trainer-card-2')).toBeVisible();
  });

  test('M2-TC02: Trainer card shows rating and hourly rate', async ({ page }) => {
    await page.goto('/trainers');
    const card = page.getByTestId('trainer-card-2');
    await expect(card).toContainText('★');
    await expect(card).toContainText('/hr');
  });

  test('M2-TC03: View profile navigates to detail route', async ({ page }) => {
    await page.goto('/trainers');
    await page.getByTestId('trainer-view-2').click();
    await expect(page).toHaveURL(/\/trainers\/2$/);
  });

  test('M2-TC04: Trainer detail shows bio and certifications', async ({ page }) => {
    await page.goto('/trainers/2');
    await expect(page.getByTestId('trainer-detail-page')).toBeVisible();
    await expect(page.getByTestId('trainer-certs')).toBeVisible();
  });

  test('M2-TC05: Trainer detail lists programs', async ({ page }) => {
    await page.goto('/trainers/2');
    await expect(page.getByTestId('trainer-program-1')).toBeVisible();
  });

  test('M2-TC06: Book CTA links to booking with trainer context', async ({ page }) => {
    await page.goto('/trainers/2');
    await page.getByTestId('trainer-book-cta').click();
    await expect(page).toHaveURL(/\/book\?/);
  });

  test('M2-TC07: Trainers filter form is present', async ({ page }) => {
    await page.goto('/trainers');
    await expect(page.getByTestId('filter-goal')).toBeVisible();
    await expect(page.getByTestId('filter-workout-type')).toBeVisible();
  });

  test('M2-TC08: Apply filters updates list without error', async ({ page }) => {
    await page.goto('/trainers');
    await page.getByTestId('filter-goal').selectOption('flexibility');
    await page.getByTestId('filter-apply').click();
    await expect(page.getByTestId('trainers-error')).toHaveCount(0);
    await expect(page.getByTestId('trainer-card-list')).toBeVisible();
  });

  test('M2-TC09: Reset filters restores full catalog', async ({ page }) => {
    await page.goto('/trainers');
    await page.getByTestId('filter-min-rating').fill('5');
    await page.getByTestId('filter-apply').click();
    await page.getByTestId('filter-reset').click();
    await expect(page.getByTestId('trainer-card-2')).toBeVisible();
  });

  test('M2-TC10: Trainer list finishes rendering cards', async ({ page }) => {
    await page.goto('/trainers');
    await expect(page.getByTestId('trainer-card-list')).toBeVisible();
    await expect(page.getByTestId('trainer-card-2')).toBeVisible();
  });

  test('M2-TC11: Second seeded trainer is visible', async ({ page }) => {
    await page.goto('/trainers');
    await expect(page.getByTestId('trainer-card-3')).toBeVisible();
  });

  test('M2-TC12: Trainer reviews section renders', async ({ page }) => {
    await page.goto('/trainers/2');
    await expect(page.getByTestId('trainer-reviews-list')).toBeVisible();
  });

  test('M2-TC13: Authenticated member sees review composer', async ({ page }) => {
    const lp = new LoginPage(page);
    await lp.login(data.member.email, data.member.password);
    await page.goto('/trainers/2');
    await expect(page.getByTestId('trainer-review-form-wrap')).toBeVisible();
  });

  test('M2-TC14: Trainers nav link is reachable from home', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('nav-trainers').click();
    await expect(page).toHaveURL(/\/trainers$/);
  });

  test('M2-TC15: Trainer card exposes data-testid for automation stability', async ({ page }) => {
    await page.goto('/trainers');
    await expect(page.getByTestId('trainer-card-2')).toHaveAttribute('data-testid', 'trainer-card-2');
  });
});
