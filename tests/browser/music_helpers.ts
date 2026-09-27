import { expect, type Page } from '@playwright/test';

// Real pointer browsing enters the static shelf before aiming at a moving card.
export async function approach_shelf(page: Page) {
  await page.getByRole('heading', { name: 'NYC Music Map.' }).hover();
  const shelf = page.locator('.sound-shelf');
  await shelf.hover();
  const paused = await shelf.evaluate((element) => element.scrollLeft);
  await page.waitForTimeout(200);
  expect(await shelf.evaluate((element) => element.scrollLeft)).toBe(paused);
}
