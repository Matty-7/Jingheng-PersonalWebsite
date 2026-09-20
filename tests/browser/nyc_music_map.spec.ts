import { test, expect } from '@playwright/test';

test('music selection keeps the recording, place and Google map together', async ({ page }) => {
  await page.goto('/portfolio/nyc-music-map');
  await expect(page.getByRole('heading', { name: 'NYC Music Map.' })).toBeVisible();
  await expect(page.locator('audio')).toHaveCount(1);
  await expect(page.locator('audio')).not.toHaveAttribute('src');
  await page.getByRole('button', { name: 'Riverside', exact: true }).press('Enter');
  const map_link = page.getByRole('link', { name: 'Open in Google Maps', exact: true });
  const map_frame = page.locator('iframe[title="Google Maps: Riverside"]');
  const external_query = new URL((await map_link.getAttribute('href'))!).searchParams.get('query');
  expect(new URL((await map_frame.getAttribute('src'))!).searchParams.get('q')).toBe(external_query);
  await expect(page.getByRole('region', { name: 'Map of Riverside' })).toContainText('Representative point');
  await page.getByRole('button', { name: 'Select Cornelia Street by Taylor Swift', exact: true }).click();
  await expect(page.getByRole('article', { name: 'Selected song' })).toContainText('Taylor Swift');
  await expect(page.locator('iframe[title="Google Maps: Cornelia Street"]')).toBeVisible();
  await expect(page.locator('audio')).not.toHaveAttribute('src');
  await page.getByRole('searchbox').fill('zzzz-no-music');
  await expect(page.getByRole('heading', { name: 'No songs found.' })).toBeVisible();
  await expect(page.locator('iframe')).toHaveCount(0);
  await page.getByRole('button', { name: 'Show all songs', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Select New York State of Mind by Billy Joel' })).toHaveAttribute('aria-pressed', 'true');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('failed preview and map requests leave usable links and silent selection', async ({ page }) => {
  await page.route('https://audio-ssl.itunes.apple.com/**', (route) => route.abort());
  let intercepted_maps = 0;
  await page.route('https://www.google.com/maps/embed/v1/place?**', (route) => { intercepted_maps += 1; return route.abort(); });
  await page.goto('/portfolio/nyc-music-map');
  await expect.poll(() => intercepted_maps).toBeGreaterThan(0);
  await page.getByRole('button', { name: 'Play preview of New York State of Mind', exact: true }).click();
  await expect(page.getByText('This preview is unavailable. You can still open the song on Apple Music.')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Listen on Apple Music', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Open in Google Maps', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Select Chelsea Hotel #2 by Leonard Cohen', exact: true }).click();
  await expect(page.locator('audio')).not.toHaveAttribute('src');
  await expect(page.getByRole('button', { name: 'Play preview of Chelsea Hotel #2', exact: true })).toBeVisible();
  await expect(page.getByText('Song preview provided courtesy of iTunes.')).toBeVisible();
});

test('reduced motion and keyboard selection remain usable', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/portfolio/nyc-music-map');
  await page.getByRole('button', { name: 'Select Bleecker Street by Simon & Garfunkel', exact: true }).press('Space');
  await expect(page.getByRole('heading', { name: 'Bleecker Street', exact: true })).toBeVisible();
  expect(await page.locator('.sound-story').evaluate((element) => getComputedStyle(element).animationName)).toBe('none');
  await expect(page.locator('audio')).not.toHaveAttribute('src');
});

test('expanded catalog exposes new boroughs and the end of the collection', async ({ page }) => {
  await page.goto('/portfolio/nyc-music-map');
  const search = page.getByRole('searchbox');
  for (const [query, song, place] of [
    ['Queens', 'Select Queens Get the Money by Nas', 'Queens'],
    ['Bronx', 'Select Bronx Blues by Stan Getz & Oscar Peterson Trio', 'The Bronx'],
    ['Staten Island', 'Select Staten Island Groove by Down to the Bone', 'Staten Island'],
    ['Lullaby of Broadway', 'Select Lullaby of Broadway by Doris Day', 'Broadway'],
  ]) {
    await search.fill(query);
    await page.getByRole('button', { name: song, exact: true }).press('Enter');
    await expect(page.getByRole('region', { name: `Map of ${place}`, exact: true })).toBeVisible();
    const external_query = new URL((await page.getByRole('link', { name: 'Open in Google Maps', exact: true }).getAttribute('href'))!).searchParams.get('query');
    expect(new URL((await page.locator('iframe').getAttribute('src'))!).searchParams.get('q')).toBe(external_query);
    await expect(page.locator('audio')).not.toHaveAttribute('src');
  }
  await search.fill('Jazz');
  await expect(page.getByRole('button', { name: 'Select Central Park West by John Coltrane', exact: true })).toHaveCount(1);
  await search.fill('');
  await page.getByRole('button', { name: 'Select Lullaby of Broadway by Doris Day', exact: true }).press('Space');
  await expect(page.getByRole('article', { name: 'Selected song' })).toContainText('Doris Day');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
