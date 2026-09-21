import { expect, test } from '@playwright/test';

test.use({ reducedMotion: 'reduce' });

// Keep real iframe navigation while isolating these history tests from Google uptime.
test.beforeEach(async ({ page }) => {
  await page.route('https://www.google.com/maps/embed/**', (route) =>
    route.fulfill({
      contentType: 'text/html',
      body: '<!doctype html><title>Map preview fixture</title>',
    }),
  );
});

test('film links restore a scene and preserve browser history and unrelated URL fields', async ({
  page,
}) => {
  await page.goto(
    '/portfolio/nyc-film-map?film=manhattan&place=sutton-square&utm_source=friend#reader',
  );
  const sutton = page.getByRole('region', {
    name: 'Details for Sutton Square',
  });
  await expect(sutton).toBeVisible();
  await page.reload();
  await expect(sutton).toBeVisible();
  await page
    .getByRole('button', { name: "You've Got Mail 1998", exact: true })
    .click();
  await page
    .locator('summary.cinema-place-button[aria-label*="Café Lalo"]')
    .click();
  await expect(
    page.getByRole('region', { name: 'Details for Café Lalo' }),
  ).toBeVisible();
  expect(new URL(page.url()).searchParams.get('place')).toBe('cafe-lalo');
  expect(new URL(page.url()).searchParams.get('utm_source')).toBe('friend');
  expect(new URL(page.url()).hash).toBe('#reader');
  await page.goBack();
  await expect(page.locator('.cinema-location[open]')).toHaveCount(0);
  await page.goBack();
  await expect(sutton).toBeVisible();
  await page.goForward();
  await expect(
    page.getByRole('button', { name: "You've Got Mail 1998", exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
  await page.goto('/portfolio/nyc-film-map?film=anora&place=sutton-square');
  await expect(
    page.getByRole('button', { name: 'Anora 2024', exact: true }),
  ).toBeEnabled();
  await expect(page.locator('.cinema-location[open]')).toHaveCount(0);
  expect(new URL(page.url()).searchParams.has('place')).toBe(false);
});

test('literary links restore reading and search without losing Back and Forward', async ({
  page,
}) => {
  await page.goto(
    '/portfolio/nyc-literary-map?work=gatsby&passage=queensboro-bridge',
  );
  const title = page.getByRole('article').getByRole('heading', { level: 2 });
  await expect(title).toHaveText('Queensboro Bridge');
  await page.getByRole('button', { name: 'Next passage' }).click();
  await expect(title).toHaveText('Central Park');
  expect(new URL(page.url()).searchParams.get('passage')).toBe('central-park');
  await page.reload();
  await expect(title).toHaveText('Central Park');
  await page.goBack();
  await expect(title).toHaveText('Queensboro Bridge');
  await page.goForward();
  await expect(title).toHaveText('Central Park');
  const history_length = await page.evaluate(() => history.length);
  await page.getByRole('searchbox').fill('zzzz-no-passage');
  await expect(
    page.getByRole('heading', { name: 'No passages found' }),
  ).toBeVisible();
  expect(await page.evaluate(() => history.length)).toBe(history_length);
  await page.reload();
  await expect(
    page.getByRole('heading', { name: 'No passages found' }),
  ).toBeVisible();
  await page.goto('/portfolio/nyc-literary-map?work=missing&passage=missing');
  await expect(title).toHaveText('Washington Square');
});

test('music links restore a place and allow pointer and keyboard selections after reload', async ({
  page,
}) => {
  await page.goto(
    '/portfolio/nyc-music-map?track=new-york-state-of-mind&place=riverside',
  );
  await expect(
    page.getByRole('button', { name: 'Riverside', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
  const cornelia = page.getByRole('button', {
    name: 'Select Cornelia Street by Taylor Swift',
    exact: true,
  });
  await cornelia.click();
  await expect(
    page.getByRole('article', { name: 'Selected song' }),
  ).toContainText('Taylor Swift');
  expect(new URL(page.url()).searchParams.get('track')).toBe('cornelia-street');
  await page.reload();
  await expect(cornelia).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('audio')).not.toHaveAttribute('src');
  await page.goBack();
  await expect(
    page.getByRole('button', { name: 'Riverside', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
  await page.goForward();
  await expect(cornelia).toHaveAttribute('aria-pressed', 'true');
  await page
    .getByRole('button', {
      name: 'Select Bleecker Street by Simon & Garfunkel',
      exact: true,
    })
    .press('Space');
  await expect(
    page.getByRole('article', { name: 'Selected song' }),
  ).toContainText('Bleecker Street');
  await page
    .getByRole('button', { name: 'Show all places', exact: true })
    .click();
  await page.getByRole('searchbox').fill('zzzz-no-track');
  await page.reload();
  await expect(
    page.getByRole('region', { name: 'Map of all songs' }),
  ).toBeVisible();
  await expect(
    page.getByRole('status').filter({ hasText: '0 matching songs' }),
  ).toBeVisible();
  await page.goto(
    '/portfolio/nyc-music-map?track=missing&place=missing&view=invalid',
  );
  await expect(
    page.getByRole('button', {
      name: 'Select Bushwick Blues by Delta Spirit',
    }),
  ).toHaveAttribute('aria-pressed', 'true');
});

test('music history keeps same-song playback and stops it when the recording changes', async ({
  page,
}) => {
  const sample_count = 8000 * 30;
  const wav = Buffer.alloc(44 + sample_count * 2);
  wav.write('RIFF', 0);
  wav.writeUInt32LE(wav.length - 8, 4);
  wav.write('WAVEfmt ', 8);
  wav.writeUInt32LE(16, 16);
  wav.writeUInt16LE(1, 20);
  wav.writeUInt16LE(1, 22);
  wav.writeUInt32LE(8000, 24);
  wav.writeUInt32LE(16000, 28);
  wav.writeUInt16LE(2, 32);
  wav.writeUInt16LE(16, 34);
  wav.write('data', 36);
  wav.writeUInt32LE(sample_count * 2, 40);
  await page.route('https://audio-ssl.itunes.apple.com/**', (route) =>
    route.fulfill({ status: 200, contentType: 'audio/wav', body: wav }),
  );
  await page.goto('/portfolio/nyc-music-map?track=new-york-state-of-mind');
  await expect(page.getByRole('searchbox')).toBeEnabled();
  await page
    .getByRole('button', {
      name: 'Play preview of New York State of Mind',
      exact: true,
    })
    .click();
  const audio = page.locator('audio');
  await expect
    .poll(() =>
      audio.evaluate((element: HTMLAudioElement) => element.currentTime),
    )
    .toBeGreaterThan(0);
  await page.getByRole('button', { name: 'Riverside', exact: true }).click();
  await page.goBack();
  await expect(
    page.getByRole('button', { name: 'Chinatown', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
  expect(
    await audio.evaluate((element: HTMLAudioElement) => element.paused),
  ).toBe(false);
  await page
    .getByRole('button', {
      name: 'Select Cornelia Street by Taylor Swift',
      exact: true,
    })
    .click();
  await expect(audio).not.toHaveAttribute('src');
  await page.goBack();
  await expect(
    page.getByRole('article', { name: 'Selected song' }),
  ).toContainText('Billy Joel');
  await expect(audio).not.toHaveAttribute('src');
  expect(
    await audio.evaluate((element: HTMLAudioElement) => element.paused),
  ).toBe(true);
});

test('cross-map history preserves the destination map parameters after reload', async ({
  page,
}) => {
  await page.goto(
    '/portfolio/nyc-music-map?track=new-york-state-of-mind&place=riverside',
  );
  await expect(
    page.getByRole('button', { name: 'Riverside', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('link', { name: 'Explore the NYC Film Map' }).click();
  await expect(
    page.getByRole('button', { name: 'Manhattan 1979', exact: true }),
  ).toBeEnabled();
  await page.reload();
  await expect(
    page.getByRole('button', { name: 'Manhattan 1979', exact: true }),
  ).toBeEnabled();
  await page.goBack();
  await expect(
    page.getByRole('button', { name: 'Riverside', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
  expect(new URL(page.url()).searchParams.get('place')).toBe('riverside');
  await page.goForward();
  await expect(
    page.getByRole('button', { name: 'Manhattan 1979', exact: true }),
  ).toBeEnabled();
});

test('a pending preview can be cancelled and cannot revive after history changes the song', async ({
  page,
}) => {
  let request_count = 0;
  let release_preview: (() => void) | undefined;
  await page.route('https://audio-ssl.itunes.apple.com/**', async (route) => {
    request_count += 1;
    await new Promise<void>((resolve) => {
      release_preview = resolve;
    });
    await route.abort();
  });
  await page.goto('/portfolio/nyc-music-map?track=cornelia-street');
  await expect(page.getByRole('searchbox')).toBeEnabled();
  await page
    .getByRole('button', {
      name: 'Play preview of Cornelia Street',
      exact: true,
    })
    .click();
  await expect.poll(() => request_count).toBe(1);
  const cancel = page.getByRole('button', {
    name: 'Cancel loading preview',
    exact: true,
  });
  await expect(cancel).toBeVisible();
  await cancel.click();
  await expect(
    page.getByRole('button', {
      name: 'Play preview of Cornelia Street',
      exact: true,
    }),
  ).toBeVisible();
  release_preview?.();
  await expect(page.locator('audio')).toHaveJSProperty('paused', true);
  await page
    .getByRole('button', {
      name: 'Select New York State of Mind by Billy Joel',
      exact: true,
    })
    .press('Space');
  await page
    .getByRole('button', {
      name: 'Play preview of New York State of Mind',
      exact: true,
    })
    .click();
  await expect.poll(() => request_count).toBe(2);
  await expect(cancel).toBeVisible();
  await page.goBack();
  await expect(
    page.getByRole('article', { name: 'Selected song' }),
  ).toContainText('Taylor Swift');
  release_preview?.();
  await expect(page.locator('audio')).not.toHaveAttribute('src');
  await expect(page.locator('audio')).toHaveJSProperty('paused', true);
  await expect(
    page.getByRole('button', {
      name: 'Play preview of Cornelia Street',
      exact: true,
    }),
  ).toBeVisible();
});
