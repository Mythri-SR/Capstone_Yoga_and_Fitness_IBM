import { test, expect } from '@playwright/test';
import { loadTestData } from '../utils/config.js';

const data = loadTestData();

function trainerIdForProgram(programId) {
  const id = Number(programId);
  return id === data.programs.hiitId || id === data.programs.powerId ? 3 : 2;
}

/** Waits for the slots GET that matches this program's trainer, then for rows to paint (avoids racing the empty-state UI). */
async function selectProgramAndWaitSlots(page, programId) {
  const trainerId = trainerIdForProgram(programId);
  const slotsWait = page.waitForResponse(
    (r) => {
      if (r.request().method() !== 'GET' || !r.ok() || !r.url().includes('/api/slots')) return false;
      try {
        const u = new URL(r.url());
        return u.searchParams.get('trainerId') === String(trainerId);
      } catch {
        return false;
      }
    },
    { timeout: 20_000 }
  );
  await page.getByTestId('book-program-select').selectOption(String(programId));
  await slotsWait;
  await expect(page.locator('[data-testid^="slot-row-"]').first()).toBeVisible({ timeout: 20_000 });
}

test.describe('Module 5 — Session booking UI (10 scenarios)', () => {
  test('M5-TC01: Guest sees sign-in hint on book page', async ({ page }) => {
    await page.goto('/book');
    await expect(page.getByTestId('book-login-hint')).toBeVisible();
  });

  test('M5-TC02: Book route reachable from navigation', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('nav-book').click();
    await expect(page).toHaveURL(/\/book$/);
  });

  test('M5-TC03: Empty program selection shows no slot rows for booking', async ({ page }) => {
    await page.goto('/book');
    await page.getByTestId('book-program-select').selectOption('');
    await expect(page.getByTestId('book-no-slots')).toBeVisible();
  });

  test('M5-TC04: Slot rows include schedule copy', async ({ page }) => {
    await page.goto('/book');
    await selectProgramAndWaitSlots(page, data.programs.vinyasaId);
    await expect(page.getByTestId('book-slot-list')).toContainText(/live|recorded|personal/i);
  });

  test('M5-TC05: Calendar section exposes heading', async ({ page }) => {
    await page.goto('/book');
    await expect(page.getByRole('heading', { name: /open slots/i })).toBeVisible();
  });

  test('M5-TC06: Program picker lists every active program', async ({ page }) => {
    await page.goto('/book');
    const options = page.getByTestId('book-program-select').locator('option');
    await expect(options).toHaveCount(5);
  });

  test('M5-TC07: Login hint deep-links to auth screen', async ({ page }) => {
    await page.goto('/book');
    await page.getByTestId('book-login-hint').getByRole('link', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/login$/);
  });

  test('M5-TC08: Initial book error area is hidden', async ({ page }) => {
    await page.goto('/book');
    await expect(page.getByTestId('book-error')).toHaveCount(0);
  });

  test('M5-TC09: Slot rows render deterministic ids for automation', async ({ page }) => {
    await page.goto('/book');
    await selectProgramAndWaitSlots(page, data.programs.vinyasaId);
    const row = page.locator('[data-testid^="slot-row-"]').first();
    const tid = await row.getAttribute('data-testid');
    expect(tid).toMatch(/^slot-row-\d+$/);
  });

  test('M5-TC10: Guests still see sign-in guidance when slots are listed', async ({ page }) => {
    await page.goto('/book');
    await selectProgramAndWaitSlots(page, data.programs.vinyasaId);
    await expect(page.getByTestId('book-login-hint')).toBeVisible();
  });
});
