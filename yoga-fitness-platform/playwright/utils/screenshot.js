export async function capture(page, path) {
  await page.screenshot({ path, fullPage: true });
}
