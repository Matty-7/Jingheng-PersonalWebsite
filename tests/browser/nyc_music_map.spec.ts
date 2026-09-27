import { test, expect } from '@playwright/test';
import { approach_shelf } from './music_helpers';

test('music selection keeps the recording, place and Google map together', async ({ page }) => {
  const page_errors: string[] = [];
  page.on('pageerror', (error) => page_errors.push(error.message));
  await page.goto('/portfolio/nyc-music-map');
  await expect(page.getByRole('heading', { name: 'NYC Music Map.' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Select New York State of Mind by Billy Joel', exact: true })).toBeEnabled();
  await page.getByRole('button', { name: 'Select New York State of Mind by Billy Joel', exact: true }).press('Enter');
  await expect(page.locator('audio')).toHaveCount(1);
  await expect(page.locator('audio')).not.toHaveAttribute('src');
  await page.getByRole('button', { name: 'Riverside', exact: true }).press('Enter');
  const map_link = page.getByRole('link', { name: 'Open in Google Maps', exact: true });
  const map_frame = page.locator('iframe[title="Google Maps: Riverside"]');
  const external_query = new URL((await map_link.getAttribute('href'))!).searchParams.get('query');
  expect(new URL((await map_frame.getAttribute('src'))!).searchParams.get('center')).toBe(external_query);
  await expect(page.getByRole('region', { name: 'Map of Riverside' })).toContainText('Representative point');
  await approach_shelf(page);
  await page.getByRole('button', { name: 'Select Cornelia Street by Taylor Swift', exact: true }).click();
  await expect(page.getByRole('article', { name: 'Selected song' })).toContainText('Taylor Swift');
  await expect(page.locator('iframe[title="Google Maps: Cornelia Street"]')).toBeVisible();
  await expect(page.locator('audio')).not.toHaveAttribute('src');
  await page.getByRole('searchbox').fill('zzzz-no-music');
  await expect(page.getByRole('heading', { name: 'No songs found.' })).toBeVisible();
  await expect(page.locator('iframe')).toHaveCount(0);
  await page.getByRole('button', { name: 'Show all songs', exact: true }).click();
  try {
    await expect(page.getByRole('button', { name: 'Select Bushwick Blues by Delta Spirit' })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('searchbox')).toHaveValue('');
  } catch (error) {
    console.log('Music reset diagnostics', { page_errors, state: await page.evaluate(() => ({
      query: document.querySelector<HTMLInputElement>('.sound-search input')?.value,
      albums: document.querySelectorAll('.sound-album').length,
      selected: document.querySelector('.sound-album[aria-pressed="true"]')?.getAttribute('aria-label'),
      empty: document.querySelector('.sound-empty')?.textContent,
      active: document.activeElement?.tagName,
      scroll_y: window.scrollY,
    })) });
    throw error;
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('reduced motion and keyboard selection remain usable', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/portfolio/nyc-music-map');
  await expect(page.getByRole('button', { name: 'Select Bleecker Street by Simon & Garfunkel', exact: true })).toBeEnabled();
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
    expect(new URL((await page.locator('iframe').getAttribute('src'))!).searchParams.get('center')).toBe(external_query);
    await expect(page.locator('audio')).not.toHaveAttribute('src');
  }
  await search.fill('Jazz');
  await expect(page.getByRole('button', { name: 'Select Central Park West by John Coltrane', exact: true })).toHaveCount(1);
  await search.fill('');
  await page.getByRole('button', { name: 'Select Lullaby of Broadway by Doris Day', exact: true }).press('Space');
  await expect(page.getByRole('article', { name: 'Selected song' })).toContainText('Doris Day');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('all places include shared recordings and survive catalog filtering', async ({ page }) => {
  await page.goto('/portfolio/nyc-music-map');
  await page.getByRole('searchbox').fill('Harlem River');
  await page.getByRole('button', { name: 'Show all places', exact: true }).click();
  await expect(page.getByRole('searchbox')).toHaveValue('');
  await expect(page.getByRole('region', { name: 'Map of all songs' })).toBeVisible();
  await page.getByRole('button', { name: 'Select Coney Island Baby by Lou Reed', exact: true }).press('Enter');
  const island = page.getByRole('button', { name: /^Coney Island:/ });
  await island.press('Enter');
  await page.getByRole('button', { name: 'Choose coney island (feat. The National) by Taylor Swift at Coney Island', exact: true }).click();
  await expect(page.getByRole('article', { name: 'Selected song' })).toContainText('Taylor Swift');
  await expect(page.locator('audio')).not.toHaveAttribute('src');
  await page.getByRole('button', { name: 'Selected place', exact: true }).click();
  await expect(page.getByRole('region', { name: 'Map of Coney Island' })).toBeVisible();
  await page.getByRole('button', { name: 'Show all places', exact: true }).click();
  await page.getByRole('searchbox').fill('zzzz-no-music');
  await expect(page.getByRole('region', { name: 'Map of all songs' })).toBeVisible();
  await expect(page.getByRole('status').filter({ hasText: '0 matching songs' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('overview remains selectable when tiles fail and keyboard clusters expand', async ({ page }) => {
  await page.route('https://tile.openstreetmap.org/**', (route) => route.abort());
  await page.goto('/portfolio/nyc-music-map');
  await page.getByRole('button', { name: 'Show all places', exact: true }).click();
  await expect(page.getByText('Map tiles unavailable.', { exact: false })).toBeVisible();
  const cluster = page.getByRole('button', { name: /music places. Zoom to expand./ }).first();
  await expect(cluster).toBeVisible();
  const first_tile = await page.locator('.sound-overview .leaflet-tile').first().getAttribute('src');
  await cluster.press('Space');
  await expect.poll(() => page.locator('.sound-overview .leaflet-tile').first().getAttribute('src')).not.toBe(first_tile);
  await expect(page.locator('.sound-overview')).toBeFocused();
  await page.getByRole('button', { name: 'Show all places', exact: true }).click();
  await page.getByRole('button', { name: 'Retry map', exact: true }).click();
  await expect(page.getByRole('button', { name: /music places. Zoom to expand./ }).first()).toBeVisible();
  await page.getByRole('button', { name: 'Selected place', exact: true }).click();
  await expect(page.getByRole('link', { name: 'Open in Google Maps', exact: true })).toBeVisible();
});
