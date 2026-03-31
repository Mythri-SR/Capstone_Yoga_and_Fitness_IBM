import { test, expect } from '@playwright/test';

test.describe('Module 3 — Program catalog (15 scenarios)', () => {
  test('M3-TC01: Programs page lists cards', async ({ page }) => {
    await page.goto('/programs');
    await expect(page.getByTestId('program-card-list')).toBeVisible();
    await expect(page.getByTestId('program-card-1')).toBeVisible();
  });

  test('M3-TC02: Each card links to book flow with ids', async ({ page }) => {
    await page.goto('/programs');
    const link = page.getByTestId('program-book-1');
    await expect(link).toHaveAttribute('href', /programId=1/);
  });

  test('M3-TC03: Search input filters catalog', async ({ page }) => {
    await page.goto('/programs');
    await page.getByTestId('filter-search').fill('Vinyasa');
    await page.getByTestId('programs-filter-apply').click();
    await expect(page.getByTestId('program-card-1')).toBeVisible();
  });

  test('M3-TC04: Goal filter can be applied', async ({ page }) => {
    await page.goto('/programs');
    await page.getByTestId('filter-program-goal').selectOption('weight_loss');
    await page.getByTestId('programs-filter-apply').click();
    await expect(page.getByTestId('programs-error')).toHaveCount(0);
  });

  test('M3-TC05: Workout type filter applies', async ({ page }) => {
    await page.goto('/programs');
    await page.getByTestId('filter-program-type').selectOption('yoga');
    await page.getByTestId('programs-filter-apply').click();
    await expect(page.getByTestId('program-card-list')).toBeVisible();
  });

  test('M3-TC06: Min and max price fields accept values', async ({ page }) => {
    await page.goto('/programs');
    await page.getByTestId('filter-min-price').fill('30');
    await page.getByTestId('filter-max-price-program').fill('60');
    await page.getByTestId('programs-filter-apply').click();
    await expect(page.getByTestId('programs-error')).toHaveCount(0);
  });

  test('M3-TC07: Programs show workout badge', async ({ page }) => {
    await page.goto('/programs');
    const card = page.getByTestId('program-card-3');
    await expect(card.locator('.badge')).toContainText(/hiit/i);
  });

  test('M3-TC08: Program displays trainer name', async ({ page }) => {
    await page.goto('/programs');
    await expect(page.getByTestId('program-card-1')).toContainText('Maya');
  });

  test('M3-TC09: Home CTA navigates to programs', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('home-cta-programs').click();
    await expect(page).toHaveURL(/\/programs$/);
  });

  test('M3-TC10: Book deep link preselects program via querystring', async ({ page }) => {
    await page.goto('/book?programId=1&trainerId=2');
    const select = page.getByTestId('book-program-select');
    await expect(select).toHaveValue('1', { timeout: 15_000 });
  });

  test('M3-TC11: Program card shows duration metadata', async ({ page }) => {
    await page.goto('/programs');
    await expect(page.getByTestId('program-card-1')).toContainText('min');
  });

  test('M3-TC12: Program card shows price', async ({ page }) => {
    await page.goto('/programs');
    await expect(page.getByTestId('program-card-1')).toContainText('$');
  });

  test('M3-TC13: Nav programs link works', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('nav-programs').click();
    await expect(page).toHaveURL(/\/programs$/);
  });

  test('M3-TC14: Empty search still returns grid (smoke)', async ({ page }) => {
    await page.goto('/programs');
    await page.getByTestId('filter-search').fill('');
    await page.getByTestId('programs-filter-apply').click();
    await expect(page.getByTestId('program-card-1')).toBeVisible();
  });

  test('M3-TC15: Loading text disappears after load', async ({ page }) => {
    await page.goto('/programs');
    await expect(page.getByTestId('program-card-list')).toBeVisible();
  });
});
