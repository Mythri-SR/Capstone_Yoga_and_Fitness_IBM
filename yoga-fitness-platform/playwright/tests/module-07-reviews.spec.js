import { test, expect } from '@playwright/test';
import { loadTestData } from '../utils/config.js';
import { LoginPage } from '../pages/LoginPage.js';

const data = loadTestData();

test.describe.serial('Module 7 — Ratings & reviews (15 scenarios)', () => {
  test('M7-TC01: Guest cannot see composer on trainer page', async ({ page }) => {
    await page.goto('/trainers/2');
    await expect(page.getByTestId('trainer-review-form-wrap')).toHaveCount(0);
  });

  test('M7-TC02: Composer renders for authenticated member', async ({ page }) => {
    const lp = new LoginPage(page);
    await lp.login(data.member.email, data.member.password);
    await page.goto('/trainers/2');
    await expect(page.getByTestId('trainer-review-form-wrap')).toBeVisible();
  });

  test('M7-TC03: Submitting scoped review shows success banner', async ({ page }) => {
    const lp = new LoginPage(page);
    await lp.login(data.member.email, data.member.password);
    await page.goto('/trainers/3');
    await page.getByTestId('review-program-select').selectOption('3');
    await page.getByTestId('review-rating').selectOption('5');
    await page.getByTestId('review-comment').fill(`Structured review ${Date.now()}`);
    await page.getByTestId('review-submit').click();
    const success = page.getByTestId('review-success');
    const duplicate = page.getByText(/already reviewed/i);
    await expect(success.or(duplicate)).toBeVisible({ timeout: 15_000 });
  });

  test('M7-TC04: Rating select defaults are adjustable', async ({ page }) => {
    const lp = new LoginPage(page);
    await lp.login(data.member.email, data.member.password);
    await page.goto('/trainers/2');
    await page.getByTestId('review-rating').selectOption('2');
    await expect(page.getByTestId('review-rating')).toHaveValue('2');
  });

  test('M7-TC05: Optional program scope can target a class', async ({ page }) => {
    const lp = new LoginPage(page);
    await lp.login(data.member.email, data.member.password);
    await page.goto('/trainers/2');
    await page.getByTestId('review-program-select').selectOption('2');
    await expect(page.getByTestId('review-program-select')).toHaveValue('2');
  });

  test('M7-TC06: Comment textarea accepts long constructive feedback', async ({ page }) => {
    const lp = new LoginPage(page);
    await lp.login(data.member.email, data.member.password);
    await page.goto('/trainers/2');
    const longText = `Detailed feedback. ${'More breath cues please. '.repeat(12)}`;
    await page.getByTestId('review-comment').fill(longText);
    await expect(page.getByTestId('review-comment')).toHaveValue(longText);
  });

  test('M7-TC07: Reviews list container is always present', async ({ page }) => {
    await page.goto('/trainers/2');
    await expect(page.getByTestId('trainer-reviews-list')).toBeVisible();
  });

  test('M7-TC08: Review cards expose stable selectors', async ({ page }) => {
    await page.goto('/trainers/3');
    const items = page.locator('[data-testid^="review-"]');
    await expect(items.first()).toBeVisible();
  });

  test('M7-TC09: Trainer role hides composer', async ({ page }) => {
    const lp = new LoginPage(page);
    await lp.login(data.trainer.email, data.trainer.password);
    await page.goto('/trainers/3');
    await expect(page.getByTestId('trainer-review-form-wrap')).toHaveCount(0);
  });

  test('M7-TC10: Duplicate review attempt surfaces API error in UI', async ({ page }) => {
    const lp = new LoginPage(page);
    await lp.login(data.member.email, data.member.password);
    await page.goto('/trainers/3');
    await page.getByTestId('review-program-select').selectOption('3');
    await page.getByTestId('review-rating').selectOption('4');
    await page.getByTestId('review-comment').fill('duplicate attempt');
    await page.getByTestId('review-submit').click();
    await expect(page.getByTestId('review-error')).toBeVisible({ timeout: 15_000 });
  });

  test('M7-TC11: Star copy is visible on existing reviews', async ({ page }) => {
    await page.goto('/trainers/3');
    await expect(page.getByTestId('trainer-reviews-list')).toContainText('★');
  });

  test('M7-TC12: Review form submit button is reachable', async ({ page }) => {
    const lp = new LoginPage(page);
    await lp.login(data.member.email, data.member.password);
    await page.goto('/trainers/2');
    await expect(page.getByTestId('review-submit')).toBeEnabled();
  });

  test('M7-TC13: General review option remains available', async ({ page }) => {
    const lp = new LoginPage(page);
    await lp.login(data.member.email, data.member.password);
    await page.goto('/trainers/2');
    await page.getByTestId('review-program-select').selectOption('');
    await expect(page.getByTestId('review-program-select')).toHaveValue('');
  });

  test('M7-TC14: Trainer detail hero remains stable after review interaction', async ({ page }) => {
    const lp = new LoginPage(page);
    await lp.login(data.member.email, data.member.password);
    await page.goto('/trainers/2');
    await expect(page.getByTestId('trainer-detail-header')).toBeVisible();
    await page.getByTestId('review-comment').fill('Interaction check');
    await expect(page.getByTestId('trainer-detail-header')).toBeVisible();
  });

  test('M7-TC15: Reviews route accessible without auth', async ({ page }) => {
    await page.goto('/trainers/2');
    await expect(page.getByTestId('trainer-detail-page')).toBeVisible();
  });
});
