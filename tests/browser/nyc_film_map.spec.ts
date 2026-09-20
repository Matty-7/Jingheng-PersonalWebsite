import { test, expect } from '@playwright/test';

test('film selection keeps map, details and directions in sync', async ({ page }) => {
  await page.goto('/portfolio/nyc-film-map');
  await expect(page.getByRole('heading', { name: 'NYC Film Map.' })).toBeVisible();
  await expect(page.locator('.cinema-marker')).toHaveCount(6);
  await page.getByRole('button', { name: '2. Café Lalo', exact: true }).press('Enter');
  const details = page.getByRole('region', { name: 'Details for Café Lalo' });
  await expect(details).toContainText('vacated this address in 2024');
  await page.getByRole('button', { name: 'Close location details' }).click();
  await page.getByRole('button', { name: '2. Café Lalo', exact: true }).press('Space');
  await expect(details).toBeVisible();
  await expect(details.getByRole('link', { name: 'Walking directions' })).toHaveAttribute('href', /destination=.*201%20West%2083rd/);
  await page.getByRole('button', { name: 'Anora 2024', exact: true }).click();
  await expect(page.locator('.cinema-marker')).toHaveCount(5);
  await expect(page.locator('.cinema-place-list > li')).toHaveCount(5);
  await expect(details).toHaveCount(0);
  await page.getByRole('button', { name: /01 Tatiana Restaurant/ }).click();
  await expect(page.getByRole('region', { name: 'Details for Tatiana Restaurant & Nightclub' })).toContainText('3152 Brighton 6th Street');
  await page.getByRole('button', { name: 'All films', exact: true }).click();
  await expect(page.locator('.cinema-marker')).toHaveCount(26);
  await expect(page.locator('.cinema-place-list > li')).toHaveCount(26);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('unavailable street tiles retain usable scene references and directions', async ({ page }) => {
  await page.route('https://tile.openstreetmap.org/**', (route) => route.abort());
  await page.goto('/portfolio/nyc-film-map');
  await expect(page.getByText('The street map couldn’t load.', { exact: false })).toBeVisible({ timeout: 15000 });
  await page.getByRole('button', { name: /03 The Shop Around the Corner/ }).click();
  const details = page.getByRole('region', { name: 'Details for The Shop Around the Corner' });
  await expect(details).toContainText('106 West 69th Street');
  await expect(details.getByRole('link', { name: 'Walking directions' })).toBeVisible();
  await expect(details.getByRole('link', { name: 'Filming reference' })).toHaveAttribute('href', 'https://onthesetofnewyork.com/youvegotmail.html');
});
