import { test, expect } from '@playwright/test';

test('neighborhood selections focus the overview while search and Show all places preserve its scope', async ({ page }) => {
  await page.goto('/portfolio/nyc-music-map');
  await expect(page.getByRole('button', { name: 'Select Bushwick Blues by Delta Spirit', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.sound-catalog-heading')).toContainText('118 songs · 73 places');
  await page.getByRole('button', { name: 'Show all places', exact: true }).click();
  const tile = page.locator('.sound-overview .leaflet-tile').first();
  await expect(tile).toHaveAttribute('src', /tile.openstreetmap.org/);
  const all_tile = await tile.getAttribute('src');
  await page.getByRole('searchbox').fill('Queensbridge');
  await expect(page.getByRole('button', { name: 'Select QueensBridge Politics by Nas', exact: true })).toBeVisible();
  expect(await tile.getAttribute('src')).toBe(all_tile);
  await page.getByRole('button', { name: 'Select QueensBridge Politics by Nas', exact: true }).press('Enter');
  await expect.poll(() => tile.getAttribute('src')).not.toBe(all_tile);
  await expect(page.getByRole('button', { name: /^Queensbridge:/ })).toBeVisible();
  await page.getByRole('button', { name: 'Show all places', exact: true }).click();
  await expect.poll(() => tile.getAttribute('src')).toBe(all_tile);
  await expect(page.getByRole('searchbox')).toHaveValue('');
  await page.getByRole('searchbox').fill('Corona');
  await page.getByRole('button', { name: 'Select Me and Julio Down by the Schoolyard by Paul Simon', exact: true }).press('Enter');
  await expect(page.getByRole('article', { name: 'Selected song' })).toContainText('Queen of Corona');
  await expect(page.locator('audio')).not.toHaveAttribute('src');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('full song list stays complete during filtering and exports real Apple links', async ({ page, request }) => {
  await page.goto('/portfolio/nyc-music-map');
  const song_count = await page.locator('.sound-album').count();
  expect(song_count).toBeGreaterThanOrEqual(100);
  await page.getByRole('searchbox').fill('Queensbridge');
  await page.getByRole('button', { name: /^Songs on Apple Music/ }).press('Enter');
  await expect(page.locator('.sound-playlist-tracks a')).toHaveCount(song_count);
  await expect(page.locator('.sound-playlist-intro')).toContainText(`All ${song_count} songs`);
  await expect(page.locator('.sound-playlist-intro')).toContainText('does not create a playlist');
  await expect(page.locator('audio')).not.toHaveAttribute('src');
  const csv_response = await request.get('/api/music-playlist');
  expect(csv_response.ok()).toBe(true);
  expect(csv_response.headers()['content-type']).toContain('text/csv');
  expect(csv_response.headers()['content-disposition']).toContain('nyc_music_map.csv');
  const csv = await csv_response.text();
  expect(csv.trim().split('\r\n')).toHaveLength(song_count + 1);
  for (const link of await page.locator('.sound-playlist-tracks a').evaluateAll(links => links.map(link => link.getAttribute('href')))) {
    expect(link).toMatch(/^https:\/\/music\.apple\.com\//);
    expect(csv).toContain(link!);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('one Atlas project preserves the music, film and book recommendations', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#projects h3')).toHaveText(['Mortgage Mind Map', 'New York Atlas']);
  expect(await page.locator('main [id]').evaluateAll(elements => elements.map(element => element.id).filter(id => ['records', 'films', 'books'].includes(id)))).toEqual(['records', 'films', 'books']);
});

test('coordinate pins and artist connections stay honest across selection and export', async ({ page, request }) => {
  await page.route('https://www.google.com/maps/embed/**', route => route.fulfill({ status: 200, contentType: 'text/html', body: '<p>Map contract fixture</p>' }));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/portfolio/nyc-music-map');
  const search = page.getByRole('searchbox');
  await search.fill('Park Avenue Petite');
  await page.getByRole('button', { name: 'Select Park Avenue Petite by Blue Mitchell', exact: true }).press('Enter');
  const frame = new URL((await page.locator('iframe').getAttribute('src'))!);
  expect(frame.pathname).toBe('/maps/embed/v1/place');
  expect(frame.searchParams.get('center')).toBe('40.7578528,-73.9736145');
  expect(frame.searchParams.get('q')).toMatch(/^[23456789CFGHJMPQRVWX]{8}\+[23456789CFGHJMPQRVWX]{2}$/);
  expect(new URL((await page.getByRole('link', { name: 'Open in Google Maps' }).getAttribute('href'))!).searchParams.get('query')).toBe(frame.searchParams.get('center'));
  await search.fill('Forest Hills');
  await page.getByRole('button', { name: 'Select The Only Living Boy In New York by Simon & Garfunkel', exact: true }).press('Enter');
  await expect(page.locator('.sound-connection')).toContainText('Artist connection');
  await expect(page.locator('.sound-connection')).toContainText('official biography');
  await expect(page.getByText('In the title', { exact: true })).toHaveCount(0);
  await expect(page.getByText('About the song', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Show all places', exact: true }).click();
  await search.fill('Forest Hills');
  await page.getByRole('button', { name: 'Select The Only Living Boy In New York by Simon & Garfunkel', exact: true }).press('Enter');
  await page.getByRole('button', { name: /^Forest Hills:/ }).press('Enter');
  await expect(page.locator('.sound-map-popup')).toContainText('Artist connection');
  await page.getByRole('button', { name: 'Choose The Only Living Boy In New York by Simon & Garfunkel at Forest Hills', exact: true }).click();
  await expect(page.locator('audio')).not.toHaveAttribute('src');
  const csv = await (await request.get('/api/music-playlist')).text();
  expect(csv.split('\r\n').find(line => line.includes('The Only Living Boy In New York'))).toContain('Forest Hills');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
