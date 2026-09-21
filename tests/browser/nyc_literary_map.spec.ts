import { expect, test } from '@playwright/test';
import catalog from '../../content/nyc_literary_locations.json' with { type: 'json' };

test('literary choices keep the Google destination and sourced passage together without the embedded map', async ({ page }) => {
  let intercepted_maps = 0;
  await page.route('https://www.google.com/maps/embed/v1/place?**', (route) => { intercepted_maps += 1; return route.abort(); });
  await page.goto('/portfolio/nyc-literary-map');
  await expect.poll(() => intercepted_maps).toBeGreaterThan(0);
  await expect(page.getByRole('heading', { name: 'NYC Literary Map.' })).toBeVisible();
  await page.locator('.literary-catalog > summary').press('Enter');
  await page.getByRole('button', { name: 'The Great Gatsby F. Scott Fitzgerald 1925 · Book' }).press('Enter');
  await expect(page.locator('.literary-place-index button')).toHaveCount(2);
  const reader = page.getByRole('article');
  await expect(reader).toContainText('The city seen from the Queensboro Bridge');
  await expect(page.locator('.literary-google-map')).toHaveAttribute('src', new RegExp(`q=${encodeURIComponent(catalog.entries.find((entry) => entry.id === 'queensboro-bridge')!.plus_code)}`));
  await page.getByRole('button', { name: 'Next passage' }).click();
  await expect(reader.getByRole('heading', { level: 2 })).toHaveText('Central Park');
  await expect(reader.getByRole('link', { name: 'Read the source' })).toHaveAttribute('href', /pg64317-images.html#chapter-4$/);
  await expect(reader.getByRole('link', { name: 'Open in Google Maps' })).toHaveAttribute('href', /query=40.7663%2C-73.9774/);
  await page.getByRole('button', { name: 'The Old House at Home Joseph Mitchell 1940 · The New Yorker' }).click();
  await expect(reader).toContainText('15 Seventh Street');
  await expect(reader.getByRole('link', { name: 'Read the source' })).toHaveAttribute('href', 'https://www.newyorker.com/magazine/1940/04/13/the-old-house-at-home');
  await page.getByRole('button', { name: 'Hide map', exact: true }).click();
  await expect(page.locator('.literary-google-map')).toHaveCount(0);
  await expect(reader.locator('blockquote')).toContainText('McSorley’s');
  await page.getByRole('button', { name: 'All works Books & magazines' }).click();
  await expect(page.locator('.literary-place-index button')).toHaveCount(43);
  await expect(reader.getByRole('heading', { level: 2 })).toHaveText('McSorley’s Old Ale House');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});


test('literary search keeps focus, filters locally, handles no results and restores the collection', async ({ page }) => {
  let intercepted_maps = 0;
  await page.route('https://www.google.com/maps/embed/v1/place?**', (route) => { intercepted_maps += 1; return route.abort(); });
  await page.goto('/portfolio/nyc-literary-map');
  await expect.poll(() => intercepted_maps).toBeGreaterThan(0);
  await expect(page.locator('.literary-catalog')).not.toHaveAttribute('open');
  await expect(page.locator('.literary-places')).not.toHaveAttribute('open');
  const search = page.getByRole('searchbox', { name: 'Search this collection' });
  await search.fill('LARSEN Harlem');
  await expect(search).toBeFocused();
  await expect(page.getByRole('status')).toHaveText('3 matching passages');
  await expect(page.getByRole('article').getByRole('heading', { level: 2 })).toHaveText('Lenox Avenue');
  await page.getByRole('button', { name: 'Next passage' }).click();
  await expect(page.getByRole('article').getByRole('heading', { level: 2 })).toHaveText('Harlem');
  await expect(page.locator('.literary-google-map')).toHaveAttribute('src', /center=40.8116%2C-73.9465/);
  await page.locator('.literary-catalog > summary').press('Enter');
  await page.getByRole('button', { name: 'Harlem Shadows Claude McKay 1922 · Book' }).click();
  await expect(page.getByRole('heading', { name: 'No passages found' })).toBeVisible();
  await expect(page.getByRole('article')).toHaveCount(0);
  await expect(page.locator('.literary-google-map')).toHaveCount(0);
  await page.getByRole('region', { name: 'No matching passages' }).getByRole('button', { name: 'Clear filters' }).press('Enter');
  await expect(search).toHaveValue('');
  await expect(page.getByRole('status')).toHaveText('43 matching passages');
  await expect(page.getByRole('article').getByRole('heading', { level: 2 })).toHaveText('Washington Square');
  await search.fill('Spuyten');
  await expect(page.getByRole('article')).toContainText('Chapter XXIX');
  await expect(page.getByRole('article').getByRole('link', { name: 'Open in Google Maps' })).toHaveAttribute('href', new RegExp(`query=${encodeURIComponent(catalog.entries.find((entry) => entry.id === 'carrie-spuyten-duyvil')!.coordinates.join(','))}`));
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});


test('every literary selection keeps its marker, center and external destination together', async ({ page }) => {
  await page.route('https://www.google.com/maps/embed/v1/place?**', (route) => route.abort());
  await page.goto('/portfolio/nyc-literary-map');
  await expect(page.getByRole('searchbox')).toBeEnabled();
  for (const [index, entry] of catalog.entries.entries()) {
    const reader = page.getByRole('article');
    await expect(reader.getByRole('heading', { level: 2 })).toHaveText(entry.place);
    const embedded = new URL((await page.locator('.literary-google-map').getAttribute('src'))!);
    const external = new URL((await reader.getByRole('link', { name: 'Open in Google Maps' }).getAttribute('href'))!);
    expect(embedded.pathname).toBe('/maps/embed/v1/place');
    expect(embedded.searchParams.get('q')).toBe(entry.plus_code);
    expect(embedded.searchParams.get('center')).toBe(entry.coordinates.join(','));
    expect(embedded.searchParams.get('zoom')).toBe('15');
    expect(external.searchParams.get('query')).toBe(entry.coordinates.join(','));
    expect(external.searchParams.has('key')).toBe(false);
    if (index < catalog.entries.length - 1) await page.getByRole('button', { name: 'Next passage' }).click();
  }
});
