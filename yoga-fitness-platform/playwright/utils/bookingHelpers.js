import { expect } from '@playwright/test';

/**
 * Book button for the first visible open slot (avoids assuming slot id 1 when the DB is not pristine).
 */
export async function firstOpenBookButton(page, bookPage) {
  const row = page.locator('[data-testid^="slot-row-"]').first();
  await expect(row).toBeVisible({ timeout: 15_000 });
  const tid = await row.getAttribute('data-testid');
  const slotId = Number(tid.replace('slot-row-', ''));
  return bookPage.slotButton(slotId);
}

/**
 * Clicks a Book button and waits for success copy (avoids waitForResponse URL quirks with the Vite proxy).
 */
export async function clickBookAndExpectSuccess(_page, bookLocator, successLocator) {
  await bookLocator.scrollIntoViewIfNeeded();
  await bookLocator.click();
  await expect(successLocator).toBeVisible({ timeout: 30_000 });
}
