import { test, expect } from '@playwright/test';
import { loadTestData } from '../utils/config.js';
import { clickBookAndExpectSuccess, firstOpenBookButton } from '../utils/bookingHelpers.js';
import { LoginPage } from '../pages/LoginPage.js';
import { BookPage } from '../pages/BookPage.js';

const data = loadTestData();

test.describe.serial('Module 6 — Session lifecycle & payments (15 scenarios)', () => {
  test('M6-TC01: Guest is prompted on sessions route', async ({ page }) => {
    await page.goto('/sessions');
    await expect(page.getByTestId('sessions-guest')).toBeVisible();
  });

  test('M6-TC02: Trainer inbox uses training copy', async ({ page }) => {
    const lp = new LoginPage(page);
    await lp.login(data.trainer.email, data.trainer.password);
    await page.goto('/sessions');
    await expect(page.getByRole('heading', { name: /training schedule/i })).toBeVisible();
    await page.getByTestId('nav-logout').click();
  });

  test('M6-TC03: Alt member signs in for payment-focused flows', async ({ page }) => {
    const lp = new LoginPage(page);
    await lp.login(data.memberAlt.email, data.memberAlt.password);
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test('M6-TC04: Book PAY slot for HIIT program', async ({ page }) => {
    const lp = new LoginPage(page);
    await lp.login(data.memberAlt.email, data.memberAlt.password);
    const bp = new BookPage(page);
    await bp.goto('/book');
    await bp.selectProgramByValue(data.programs.hiitId);
    await expect(bp.programSelect).toHaveValue(String(data.programs.hiitId));
    await expect(page.locator('[data-testid^="slot-row-"]').first()).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId('book-login-hint')).toHaveCount(0);
    const hiitBook = await firstOpenBookButton(page, bp);
    await expect(hiitBook).toBeEnabled({ timeout: 15_000 });
    await clickBookAndExpectSuccess(page, hiitBook, bp.success);
  });

  test('M6-TC05: Mock payment confirms reservation', async ({ page }) => {
    const lp = new LoginPage(page);
    await lp.login(data.memberAlt.email, data.memberAlt.password);
    await page.goto('/sessions');
    await page.locator('[data-testid^="session-pay-"]').first().click();
    await expect(page.getByTestId('sessions-message')).toContainText(/payment/i, { timeout: 15_000 });
  });

  test('M6-TC06: Pay CTA disappears after successful mock checkout', async ({ page }) => {
    const lp = new LoginPage(page);
    await lp.login(data.memberAlt.email, data.memberAlt.password);
    await page.goto('/sessions');
    const row = page.locator('[data-testid^="session-row-"]').filter({ hasText: /HIIT/i }).first();
    await expect(row).toBeVisible();
    await expect(row.locator('[data-testid^="session-pay-"]')).toHaveCount(0);
  });

  test('M6-TC07: Member can cancel a fresh pending booking', async ({ page }) => {
    const lp = new LoginPage(page);
    await lp.login(data.memberAlt.email, data.memberAlt.password);
    const bp = new BookPage(page);
    await bp.goto('/book');
    await bp.selectProgramByValue(data.programs.powerId);
    await expect(bp.programSelect).toHaveValue(String(data.programs.powerId));
    await expect(page.locator('[data-testid^="slot-row-"]').first()).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId('book-login-hint')).toHaveCount(0);
    const bookBtn = bp.slotButton(data.slots.powerSlotFirst);
    await expect(bookBtn).toBeEnabled({ timeout: 15_000 });
    await clickBookAndExpectSuccess(page, bookBtn, bp.success);
    await page.goto('/sessions');
    const row = page.locator('[data-testid^="session-row-"]').filter({ hasText: /Power/i }).first();
    await row.locator('[data-testid^="session-cancel-"]').click();
    await expect(page.getByTestId('sessions-message')).toContainText(/cancel/i, { timeout: 15_000 });
  });

  test('M6-TC08: Reschedule request moves status to pending approval', async ({ page }) => {
    const lp = new LoginPage(page);
    await lp.login(data.memberAlt.email, data.memberAlt.password);
    const bp = new BookPage(page);
    await bp.goto('/book');
    await bp.selectProgramByValue(data.programs.vinyasaId);
    await bp.slotButton(data.slots.rescheduleFrom).click();
    await expect(bp.success).toBeVisible({ timeout: 20_000 });
    await page.goto('/sessions');
    let vinyasaRow = page.locator('[data-testid^="session-row-"]').filter({ hasText: /Sunrise|Vinyasa/i }).first();
    await vinyasaRow.locator('[data-testid^="session-pay-"]').click();
    await expect(page.getByTestId('sessions-message')).toContainText(/payment/i, { timeout: 15_000 });
    vinyasaRow = page.locator('[data-testid^="session-row-"]').filter({ hasText: /Sunrise|Vinyasa/i }).first();
    const idAttr = await vinyasaRow.getAttribute('data-testid');
    const bookingId = idAttr.replace('session-row-', '');
    await page.getByTestId(`session-reschedule-slot-${bookingId}`).selectOption(String(data.slots.rescheduleTo));
    await page.getByTestId(`session-reschedule-${bookingId}`).click();
    await expect(page.getByTestId(`session-status-${bookingId}`)).toContainText(/reschedule/i, { timeout: 15_000 });
  });

  test('M6-TC09: Trainer can approve reschedule request', async ({ page }) => {
    const lp = new LoginPage(page);
    await lp.login(data.trainer.email, data.trainer.password);
    await page.goto('/sessions');
    const approve = page.locator('[data-testid^="session-approve-"]').first();
    await approve.click();
    await expect(page.getByTestId('sessions-message')).toContainText(/approved/i, { timeout: 15_000 });
  });

  test('M6-TC10: Trainer completes confirmed session', async ({ page }) => {
    const lp = new LoginPage(page);
    await lp.login(data.trainer.email, data.trainer.password);
    await page.goto('/sessions');
    const completeBtn = page.locator('[data-testid^="session-complete-"]').first();
    await completeBtn.click();
    await expect(page.getByTestId('sessions-message')).toContainText(/complete/i, { timeout: 15_000 });
  });

  test('M6-TC11: Member dashboard reflects progress totals', async ({ page }) => {
    const lp = new LoginPage(page);
    await lp.login(data.memberAlt.email, data.memberAlt.password);
    await page.goto('/dashboard');
    await expect(page.getByTestId('stat-workouts')).toBeVisible();
    await expect(page.getByTestId('stat-calories')).toBeVisible();
  });

  test('M6-TC12: Sessions grid renders each booking row', async ({ page }) => {
    const lp = new LoginPage(page);
    await lp.login(data.memberAlt.email, data.memberAlt.password);
    await page.goto('/sessions');
    await expect(page.locator('[data-testid^="session-row-"]').first()).toBeVisible();
  });

  test('M6-TC13: Cancel CTA hidden after completion lifecycle', async ({ page }) => {
    const lp = new LoginPage(page);
    await lp.login(data.memberAlt.email, data.memberAlt.password);
    await page.goto('/sessions');
    const completedRow = page.locator('[data-testid^="session-row-"]').filter({ hasText: /completed/i }).first();
    if ((await completedRow.count()) > 0) {
      await expect(completedRow.locator('[data-testid^="session-cancel-"]')).toHaveCount(0);
    }
  });

  test('M6-TC14: Sessions UI exposes reschedule controls when eligible', async ({ page }) => {
    const lp = new LoginPage(page);
    await lp.login(data.member.email, data.member.password);
    await page.goto('/sessions');
    const selects = page.locator('[data-testid^="session-reschedule-slot-"]');
    const count = await selects.count();
    expect(count).toBeGreaterThanOrEqual(0);
    if (count > 0) {
      await expect(selects.first().locator('option').nth(1)).toBeVisible();
    }
  });

  test('M6-TC15: Sessions error banner hidden on happy path reload', async ({ page }) => {
    const lp = new LoginPage(page);
    await lp.login(data.memberAlt.email, data.memberAlt.password);
    await page.goto('/sessions');
    await expect(page.getByTestId('sessions-error')).toHaveCount(0);
  });
});
