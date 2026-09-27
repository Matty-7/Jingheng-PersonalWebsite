import { test, expect } from '@playwright/test';

test('neighborhood selections focus the overview while search and Show all places preserve its scope', async ({
  page,
}) => {
  // Keep real Leaflet loading/zoom behavior independent of the public tile server.
  await page.route('https://tile.openstreetmap.org/**', (route) =>
    route.fulfill({
      contentType: 'image/svg+xml',
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"><rect width="256" height="256" fill="#e5e7eb"/></svg>',
    }),
  );
  await page.goto('/portfolio/nyc-music-map');
  await expect(
    page.getByRole('button', {
      name: 'Select Bushwick Blues by Delta Spirit',
      exact: true,
    }),
  ).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.sound-catalog-heading')).toContainText(
    '118 songs · 73 places',
  );
  await page
    .getByRole('button', { name: 'Show all places', exact: true })
    .click();
  const tile = page.locator('.sound-overview .leaflet-tile').first();
  await expect(tile).toHaveAttribute('src', /tile.openstreetmap.org/);
  await expect(tile).toHaveClass(/leaflet-tile-loaded/);
  // Leaflet may retain an old zoom's tiles behind the active layer after flyTo.
  const read_camera = () =>
    page
      .locator('.sound-overview .leaflet-tile-container')
      .evaluateAll((layers) => {
        const active_layer = layers.sort(
          (left, right) =>
            Number((right as HTMLElement).style.zIndex) -
            Number((left as HTMLElement).style.zIndex),
        )[0] as HTMLElement | undefined;
        return active_layer
          ? {
              transform: active_layer.style.transform,
              tiles: Array.from(
                active_layer.querySelectorAll<HTMLImageElement>(
                  '.leaflet-tile',
                ),
                (image) => image.src,
              ).sort(),
            }
          : null;
      });
  const all_camera = await read_camera();
  expect(all_camera?.tiles.length).toBeGreaterThan(0);
  await page.getByRole('searchbox').fill('Queensbridge');
  await expect(
    page.getByRole('button', {
      name: 'Select QueensBridge Politics by Nas',
      exact: true,
    }),
  ).toBeVisible();
  expect(await read_camera()).toEqual(all_camera);
  await page
    .getByRole('button', {
      name: 'Select QueensBridge Politics by Nas',
      exact: true,
    })
    .press('Enter');
  await expect.poll(read_camera).not.toEqual(all_camera);
  await expect.poll(read_camera).toMatchObject({
    tiles: expect.arrayContaining([
      expect.stringContaining('tile.openstreetmap.org/14/'),
    ]),
  });
  const queensbridge = page.getByRole('button', { name: /^Queensbridge:/ });
  await expect(queensbridge).toBeVisible();
  await expect
    .poll(() =>
      queensbridge.evaluate((marker) => {
        const pin = marker.getBoundingClientRect();
        const map = marker.closest('.sound-overview')!.getBoundingClientRect();
        return Math.hypot(
          pin.x + pin.width / 2 - map.x - map.width / 2,
          pin.y + pin.height / 2 - map.y - map.height / 2,
        );
      }),
    )
    .toBeLessThan(2);
  await page
    .getByRole('button', { name: 'Show all places', exact: true })
    .click();
  await expect.poll(read_camera).toEqual(all_camera);
  await expect(page.getByRole('searchbox')).toHaveValue('');
  await page.getByRole('searchbox').fill('Corona');
  await page
    .getByRole('button', {
      name: 'Select Me and Julio Down by the Schoolyard by Paul Simon',
      exact: true,
    })
    .press('Enter');
  await expect(
    page.getByRole('article', { name: 'Selected song' }),
  ).toContainText('Queen of Corona');
  await expect(page.locator('audio')).not.toHaveAttribute('src');
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test('full song list stays complete during filtering and exports real Apple links', async ({
  page,
  request,
}) => {
  await page.goto('/portfolio/nyc-music-map');
  const song_count = await page.locator('.sound-album').count();
  expect(song_count).toBeGreaterThanOrEqual(100);
  await page.getByRole('searchbox').fill('Queensbridge');
  await page
    .getByRole('button', { name: /^Songs on Apple Music/ })
    .press('Enter');
  await expect(page.locator('.sound-playlist-tracks a')).toHaveCount(
    song_count,
  );
  await expect(page.locator('.sound-playlist-intro')).toContainText(
    `All ${song_count} songs`,
  );
  await expect(page.locator('.sound-playlist-intro')).toContainText(
    'does not create a playlist',
  );
  await expect(page.locator('audio')).not.toHaveAttribute('src');
  const csv_response = await request.get('/api/music-playlist');
  expect(csv_response.ok()).toBe(true);
  expect(csv_response.headers()['content-type']).toContain('text/csv');
  expect(csv_response.headers()['content-disposition']).toContain(
    'nyc_music_map.csv',
  );
  const csv = await csv_response.text();
  expect(csv.trim().split('\r\n')).toHaveLength(song_count + 1);
  for (const link of await page
    .locator('.sound-playlist-tracks a')
    .evaluateAll((links) => links.map((link) => link.getAttribute('href')))) {
    expect(link).toMatch(/^https:\/\/music\.apple\.com\//);
    expect(csv).toContain(link!);
  }
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test('one Atlas project preserves the music, film and book recommendations', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.locator('#projects h3')).toHaveText([
    'Mortgage Map',
    'New York Atlas',
  ]);
  expect(
    await page
      .locator('main [id]')
      .evaluateAll((elements) =>
        elements
          .map((element) => element.id)
          .filter((id) => ['records', 'films', 'books'].includes(id)),
      ),
  ).toEqual(['records', 'films', 'books']);
});

test('coordinate pins and artist connections stay honest across selection and export', async ({
  page,
  request,
}) => {
  await page.route('https://www.google.com/maps/embed/**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'text/html',
      body: '<p>Map contract fixture</p>',
    }),
  );
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/portfolio/nyc-music-map');
  const search = page.getByRole('searchbox');
  await search.fill('Park Avenue Petite');
  await page
    .getByRole('button', {
      name: 'Select Park Avenue Petite by Blue Mitchell',
      exact: true,
    })
    .press('Enter');
  const frame = new URL((await page.locator('iframe').getAttribute('src'))!);
  expect(frame.pathname).toBe('/maps/embed/v1/place');
  expect(frame.searchParams.get('center')).toBe('40.7578528,-73.9736145');
  expect(frame.searchParams.get('q')).toMatch(
    /^[23456789CFGHJMPQRVWX]{8}\+[23456789CFGHJMPQRVWX]{2}$/,
  );
  expect(
    new URL(
      (await page
        .getByRole('link', { name: 'Open in Google Maps' })
        .getAttribute('href'))!,
    ).searchParams.get('query'),
  ).toBe(frame.searchParams.get('center'));
  await search.fill('Forest Hills');
  await page
    .getByRole('button', {
      name: 'Select The Only Living Boy In New York by Simon & Garfunkel',
      exact: true,
    })
    .press('Enter');
  await expect(page.locator('.sound-connection')).toContainText(
    'Artist connection',
  );
  await expect(page.locator('.sound-connection')).toContainText(
    'official biography',
  );
  await expect(page.getByText('In the title', { exact: true })).toHaveCount(0);
  await expect(page.getByText('About the song', { exact: true })).toBeVisible();
  await page
    .getByRole('button', { name: 'Show all places', exact: true })
    .click();
  await search.fill('Forest Hills');
  await page
    .getByRole('button', {
      name: 'Select The Only Living Boy In New York by Simon & Garfunkel',
      exact: true,
    })
    .press('Enter');
  await page.getByRole('button', { name: /^Forest Hills:/ }).press('Enter');
  await expect(page.locator('.sound-map-popup')).toContainText(
    'Artist connection',
  );
  await page
    .getByRole('button', {
      name: 'Choose The Only Living Boy In New York by Simon & Garfunkel at Forest Hills',
      exact: true,
    })
    .click();
  await expect(page.locator('audio')).not.toHaveAttribute('src');
  const csv = await (await request.get('/api/music-playlist')).text();
  expect(
    csv
      .split('\r\n')
      .find((line) => line.includes('The Only Living Boy In New York')),
  ).toContain('Forest Hills');
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
