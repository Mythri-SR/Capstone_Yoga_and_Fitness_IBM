import { test, expect } from '@playwright/test';
import { loadTestData } from '../utils/config.js';
import { clickBookAndExpectSuccess, firstOpenBookButton } from '../utils/bookingHelpers.js';
import { LoginPage } from '../pages/LoginPage.js';
import { BookPage } from '../pages/BookPage.js';

const data = loadTestData();

test.describe('Module 5 — Booking mutations (5 serial scenarios)', () => {
  test.describe.configure({ mode: 'serial' });

  test('M5-TC12: First booking succeeds with confirmation copy', async ({ page }) => {
    const lp = new LoginPage(page);
    await lp.login(data.member.email, data.member.password);
    const bp = new BookPage(page);
    await bp.goto('/book');
    await bp.selectProgramByValue(data.programs.vinyasaId);
    await expect(bp.programSelect).toHaveValue(String(data.programs.vinyasaId));
    await expect(page.locator('[data-testid^="slot-row-"]').first()).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId('book-login-hint')).toHaveCount(0);
    const firstBook = await firstOpenBookButton(page, bp);
    await expect(firstBook).toBeEnabled({ timeout: 20_000 });
    await clickBookAndExpectSuccess(page, firstBook, bp.success);
  });

  test('M5-TC13: Duplicate booking same slot surfaces error', async ({ browser }) => {
    const ctx1 = await browser.newContext();
    const ctx2 = await browser.newContext();
    const p1 = await ctx1.newPage();
    const p2 = await ctx2.newPage();
    try {
      const lp1 = new LoginPage(p1);
      const lp2 = new LoginPage(p2);
      await lp1.login(data.member.email, data.member.password);
      await lp2.login(data.member.email, data.member.password);
      await p1.goto('/book');
      await p2.goto('/book');
      await p1.getByTestId('book-program-select').selectOption(String(data.programs.vinyasaId));
      await p2.getByTestId('book-program-select').selectOption(String(data.programs.vinyasaId));
      const row = p1.locator('[data-testid^="slot-row-"]').first();
      await expect(row).toBeVisible({ timeout: 15_000 });
      const tid = await row.getAttribute('data-testid');
      const slotId = tid.replace('slot-row-', '');
      await p1.getByTestId(`book-slot-${slotId}`).click();
      await expect(p1.getByTestId('book-success')).toBeVisible({ timeout: 20_000 });
      await p2.getByTestId(`book-slot-${slotId}`).click();
      await expect(p2.getByTestId('book-error')).toBeVisible({ timeout: 15_000 });
    } finally {
      await ctx1.close();
      await ctx2.close();
    }
  });

  test('M5-TC14: Sessions shows pending booking state', async ({ page }) => {
    const lp = new LoginPage(page);
    await lp.login(data.member.email, data.member.password);
    await page.goto('/sessions');
    const row = page.locator(`[data-testid^="session-row-"]`).first();
    await expect(row).toBeVisible();
    await expect(row.locator('[data-testid^="session-status-"]')).toContainText(/pending|confirmed/i);
  });

  test('M5-TC15: Additional open slot can still be booked', async ({ page }) => {
    const lp = new LoginPage(page);
    await lp.login(data.member.email, data.member.password);
    const bp = new BookPage(page);
    await bp.goto('/book');
    await bp.selectProgramByValue(data.programs.stretchId);
    await expect(bp.programSelect).toHaveValue(String(data.programs.stretchId));
    await expect(page.locator('[data-testid^="slot-row-"]').first()).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId('book-login-hint')).toHaveCount(0);
    const bookBtn = bp.slotButton(data.slots.stretchSlotFirst);
    await expect(bookBtn).toBeEnabled({ timeout: 15_000 });
    await clickBookAndExpectSuccess(page, bookBtn, bp.success);
  });

  test('M5-TC16: Member authenticates for booking', async ({ page }) => {
    const lp = new LoginPage(page);
    await lp.login(data.member.email, data.member.password);
    await expect(page.getByTestId('nav-logout')).toBeVisible();
  });
});
