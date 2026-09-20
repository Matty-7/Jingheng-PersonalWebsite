import { expect, test } from '@playwright/test';

test('literary choices keep the Google destination and sourced passage together without the embedded map', async ({ page }) => {
  let intercepted_maps = 0;
  await page.route('https://www.google.com/maps/embed/v1/place?**', (route) => { intercepted_maps += 1; return route.abort(); });
  await page.goto('/portfolio/nyc-literary-map');
  await expect.poll(() => intercepted_maps).toBeGreaterThan(0);
  await expect(page.getByRole('heading', { name: 'NYC Literary Map.' })).toBeVisible();
  await page.getByRole('button', { name: 'The Great Gatsby F. Scott Fitzgerald 1925 · Book' }).press('Enter');
  await expect(page.getByRole('navigation', { name: 'Literary places' }).getByRole('button')).toHaveCount(2);
  const reader = page.getByRole('article');
  await expect(reader).toContainText('The city seen from the Queensboro Bridge');
  await expect(page.locator('.literary-google-map')).toHaveAttribute('src', /q=Ed%20Koch%20Queensboro%20Bridge/);
  await page.getByRole('button', { name: 'Next passage' }).click();
  await expect(reader.getByRole('heading', { level: 2 })).toHaveText('Central Park');
  await expect(reader.getByRole('link', { name: 'Read the source' })).toHaveAttribute('href', /pg64317-images.html#chapter-4$/);
  await expect(reader.getByRole('link', { name: 'Open in Google Maps' })).toHaveAttribute('href', /query=Central%20Park%20South%20New%20York/);
  await page.getByRole('button', { name: 'The Old House at Home Joseph Mitchell 1940 · The New Yorker' }).click();
  await expect(reader).toContainText('15 Seventh Street');
  await expect(reader.getByRole('link', { name: 'Read the source' })).toHaveAttribute('href', 'https://www.newyorker.com/magazine/1940/04/13/the-old-house-at-home');
  await page.getByRole('button', { name: 'Hide map', exact: true }).click();
  await expect(page.locator('.literary-google-map')).toHaveCount(0);
  await expect(reader.locator('blockquote')).toContainText('McSorley’s');
  await page.getByRole('button', { name: 'All works Books & magazines' }).click();
  await expect(page.getByRole('navigation', { name: 'Literary places' }).getByRole('button')).toHaveCount(8);
  await expect(reader.getByRole('heading', { level: 2 })).toHaveText('Washington Square');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
