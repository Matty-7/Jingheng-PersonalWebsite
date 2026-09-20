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
  await page.route('https://www.google.com/maps?**', (route) => route.abort());
  await page.goto('/portfolio/nyc-music-map');
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

test('all places include shared recordings and survive catalog filtering', async ({ page }) => {
  await page.goto('/portfolio/nyc-music-map');
  await page.getByRole('searchbox').fill('Harlem River');
  await page.getByRole('button', { name: 'Show all places', exact: true }).click();
  await expect(page.getByRole('searchbox')).toHaveValue('');
  await expect(page.getByRole('region', { name: 'Map of all songs' })).toBeVisible();
  const island = page.getByRole('button', { name: /^Coney Island: Coney Island Baby/ });
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

test('album motion advances without playing and stops for manual and reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/portfolio/nyc-music-map');
  const shelf = page.locator('.sound-shelf');
  await expect.poll(() => shelf.evaluate((element) => element.scrollLeft)).toBeGreaterThan(4);
  await page.getByRole('button', { name: 'Pause album scrolling', exact: true }).click();
  const stopped = await shelf.evaluate((element) => element.scrollLeft);
  await page.waitForTimeout(250);
  expect(await shelf.evaluate((element) => element.scrollLeft)).toBe(stopped);
  await page.getByRole('button', { name: 'Resume album scrolling', exact: true }).click();
  await expect.poll(() => shelf.evaluate((element) => element.scrollLeft)).toBeGreaterThan(stopped + 3);
  await page.getByRole('button', { name: 'More songs', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Resume album scrolling', exact: true })).toBeVisible();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.getByRole('button', { name: 'Album scrolling off: reduced motion', exact: true })).toBeDisabled();
  await expect(page.locator('audio')).not.toHaveAttribute('src');
});

test('album motion pauses for hover, focus and touch, and reverses at the end', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/portfolio/nyc-music-map');
  const shelf = page.locator('.sound-shelf');
  const position = () => shelf.evaluate((element) => element.scrollLeft);
  await expect.poll(position).toBeGreaterThan(3);
  await shelf.hover();
  const hovered = await position();
  await page.waitForTimeout(200);
  expect(await position()).toBe(hovered);
  await page.mouse.move(0, 0);
  await expect.poll(position).toBeGreaterThan(hovered + 2);
  await page.getByRole('button', { name: 'Select New York State of Mind by Billy Joel', exact: true }).focus();
  const focused = await position();
  await page.waitForTimeout(200);
  expect(await position()).toBe(focused);
  await page.getByRole('button', { name: 'Show all places', exact: true }).focus();
  await expect.poll(position).toBeGreaterThan(focused + 2);
  await shelf.dispatchEvent('pointerdown', { pointerType: 'touch', bubbles: true });
  await expect(page.getByRole('button', { name: 'Resume album scrolling', exact: true })).toBeVisible();
  await shelf.evaluate((element) => { element.scrollLeft = element.scrollWidth; });
  const end = await position();
  await page.getByRole('button', { name: 'Resume album scrolling', exact: true }).click();
  await expect.poll(position).toBeLessThan(end - 2);
  await expect(page.locator('audio')).not.toHaveAttribute('src');
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
  await expect(page.getByRole('button', { name: /^Coney Island: Coney Island Baby/ })).toBeVisible();
  await page.getByRole('button', { name: 'Selected place', exact: true }).click();
  await expect(page.getByRole('link', { name: 'Open in Google Maps', exact: true })).toBeVisible();
});

test('changing a place preserves a playing preview and changing the song clears it', async ({ page }) => {
  const sample_count = 8000 * 10;
  const wav = Buffer.alloc(44 + sample_count * 2);
  wav.write('RIFF', 0); wav.writeUInt32LE(wav.length - 8, 4); wav.write('WAVEfmt ', 8);
  wav.writeUInt32LE(16, 16); wav.writeUInt16LE(1, 20); wav.writeUInt16LE(1, 22);
  wav.writeUInt32LE(8000, 24); wav.writeUInt32LE(16000, 28); wav.writeUInt16LE(2, 32);
  wav.writeUInt16LE(16, 34); wav.write('data', 36); wav.writeUInt32LE(sample_count * 2, 40);
  await page.route('https://audio-ssl.itunes.apple.com/**', (route) => route.fulfill({ status: 200, contentType: 'audio/wav', body: wav }));
  await page.goto('/portfolio/nyc-music-map');
  await page.getByRole('button', { name: 'Play preview of New York State of Mind', exact: true }).click();
  await expect.poll(() => page.locator('audio').evaluate((audio) => audio.currentTime)).toBeGreaterThan(0);
  const audio_src = await page.locator('audio').getAttribute('src');
  await page.getByRole('button', { name: 'Riverside', exact: true }).click();
  await expect(page.locator('audio')).toHaveAttribute('src', audio_src!);
  expect(await page.locator('audio').evaluate((audio) => audio.paused)).toBe(false);
  await page.getByRole('button', { name: 'Show all places', exact: true }).click();
  await expect(page.locator('audio')).toHaveAttribute('src', audio_src!);
  expect(await page.locator('audio').evaluate((audio) => audio.paused)).toBe(false);
  await page.getByRole('button', { name: 'Select Chelsea Hotel #2 by Leonard Cohen', exact: true }).click();
  await expect(page.locator('audio')).not.toHaveAttribute('src');
});
