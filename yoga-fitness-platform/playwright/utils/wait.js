/** Small helper for stability — prefer Playwright auto-waiting when possible. */
export async function pause(page, ms) {
  await page.waitForTimeout(ms);
}
