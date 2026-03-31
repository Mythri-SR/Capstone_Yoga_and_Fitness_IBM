import { test, expect } from '@playwright/test';

test.describe('Module 4 — Search & filters (15 scenarios)', () => {
  test('M4-TC01: Trainers goal equivalence — flexibility', async ({ page }) => {
    await page.goto('/trainers');
    await page.getByTestId('filter-goal').selectOption('flexibility');
    await page.getByTestId('filter-apply').click();
    await expect(page.getByTestId('trainers-error')).toHaveCount(0);
  });

  test('M4-TC02: Trainers goal — weight loss partition', async ({ page }) => {
    await page.goto('/trainers');
    await page.getByTestId('filter-goal').selectOption('weight_loss');
    await page.getByTestId('filter-apply').click();
    await expect(page.getByTestId('trainer-card-list')).toBeVisible();
  });

  test('M4-TC03: Trainers workout type — yoga', async ({ page }) => {
    await page.goto('/trainers');
    await page.getByTestId('filter-workout-type').selectOption('yoga');
    await page.getByTestId('filter-apply').click();
    await expect(page.getByTestId('trainer-card-2')).toBeVisible();
  });

  test('M4-TC04: Trainers min rating boundary 0', async ({ page }) => {
    await page.goto('/trainers');
    await page.getByTestId('filter-min-rating').fill('0');
    await page.getByTestId('filter-apply').click();
    await expect(page.getByTestId('trainer-card-list')).toBeVisible();
  });

  test('M4-TC05: Trainers min rating high boundary shrinks list', async ({ page }) => {
    await page.goto('/trainers');
    const before = await page.locator('[data-testid^="trainer-card-"]').count();
    expect(before).toBeGreaterThan(0);
    await page.getByTestId('filter-min-rating').fill('5');
    await page.getByTestId('filter-apply').click();
    await expect(page.getByTestId('trainers-error')).toHaveCount(0);
    const after = await page.locator('[data-testid^="trainer-card-"]').count();
    expect(after).toBeLessThan(before);
  });

  test('M4-TC06: Trainers max hourly price filter', async ({ page }) => {
    await page.goto('/trainers');
    await page.getByTestId('filter-max-price').fill('70');
    await page.getByTestId('filter-apply').click();
    await expect(page.getByTestId('trainers-error')).toHaveCount(0);
  });

  test('M4-TC07: Programs search boundary — long string', async ({ page }) => {
    await page.goto('/programs');
    await page.getByTestId('filter-search').fill('a'.repeat(200));
    await page.getByTestId('programs-filter-apply').click();
    await expect(page.getByTestId('programs-error')).toHaveCount(0);
  });

  test('M4-TC08: Programs goal + type decision table combo', async ({ page }) => {
    await page.goto('/programs');
    await page.getByTestId('filter-program-goal').selectOption('muscle_gain');
    await page.getByTestId('filter-program-type').selectOption('gym');
    await page.getByTestId('programs-filter-apply').click();
    await expect(page.getByTestId('program-card-list')).toBeVisible();
  });

  test('M4-TC09: Programs price min boundary 0', async ({ page }) => {
    await page.goto('/programs');
    await page.getByTestId('filter-min-price').fill('0');
    await page.getByTestId('programs-filter-apply').click();
    await expect(page.getByTestId('program-card-1')).toBeVisible();
  });

  test('M4-TC10: Programs max price only', async ({ page }) => {
    await page.goto('/programs');
    await page.getByTestId('filter-max-price-program').fill('100');
    await page.getByTestId('programs-filter-apply').click();
    await expect(page.getByTestId('programs-error')).toHaveCount(0);
  });

  test('M4-TC11: Trainers combined filters — goal + type', async ({ page }) => {
    await page.goto('/trainers');
    await page.getByTestId('filter-goal').selectOption('flexibility');
    await page.getByTestId('filter-workout-type').selectOption('meditation');
    await page.getByTestId('filter-apply').click();
    await expect(page.getByTestId('trainers-error')).toHaveCount(0);
  });

  test('M4-TC12: Programs meditation modality filter', async ({ page }) => {
    await page.goto('/programs');
    await page.getByTestId('filter-program-type').selectOption('meditation');
    await page.getByTestId('programs-filter-apply').click();
    await expect(page.getByTestId('program-card-list')).toBeVisible();
  });

  test('M4-TC13: Trainers HIIT pathway exposes Jordan', async ({ page }) => {
    await page.goto('/trainers');
    await page.getByTestId('filter-workout-type').selectOption('hiit');
    await page.getByTestId('filter-apply').click();
    await expect(page.getByTestId('trainer-card-3')).toBeVisible();
  });

  test('M4-TC14: Reset trainers clears restrictive rating', async ({ page }) => {
    await page.goto('/trainers');
    await page.getByTestId('filter-min-rating').fill('5');
    await page.getByTestId('filter-apply').click();
    await page.getByTestId('filter-reset').click();
    await expect(page.getByTestId('trainer-card-2')).toBeVisible();
  });

  test('M4-TC15: Programs general goal tag', async ({ page }) => {
    await page.goto('/programs');
    await page.getByTestId('filter-program-goal').selectOption('general');
    await page.getByTestId('programs-filter-apply').click();
    await expect(page.getByTestId('programs-error')).toHaveCount(0);
  });
});
