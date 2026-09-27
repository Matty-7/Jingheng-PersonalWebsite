import { test, expect } from '@playwright/test';
import { approach_shelf } from './music_helpers';

test('failed preview and map requests leave usable links and silent selection', async ({
  page,
}) => {
  await page.route('https://audio-ssl.itunes.apple.com/**', (route) =>
    route.abort(),
  );
  let intercepted_maps = 0;
  await page.route('https://www.google.com/maps/embed/v1/place?**', (route) => {
    intercepted_maps += 1;
    return route.abort();
  });
  await page.goto('/portfolio/nyc-music-map');
  await expect(
    page.getByRole('button', {
      name: 'Select New York State of Mind by Billy Joel',
      exact: true,
    }),
  ).toBeEnabled();
  await page
    .getByRole('button', {
      name: 'Select New York State of Mind by Billy Joel',
      exact: true,
    })
    .press('Enter');
  await expect.poll(() => intercepted_maps).toBeGreaterThan(0);
  await page
    .getByRole('button', {
      name: 'Play preview of New York State of Mind',
      exact: true,
    })
    .click();
  await expect(
    page.getByText(
      'This preview is unavailable. You can still open the song on Apple Music.',
    ),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Listen on Apple Music', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Open in Google Maps', exact: true }),
  ).toBeVisible();
  await approach_shelf(page);
  await page
    .getByRole('button', {
      name: 'Select Chelsea Hotel #2 by Leonard Cohen',
      exact: true,
    })
    .click();
  await expect(page.locator('audio')).not.toHaveAttribute('src');
  await expect(
    page.getByRole('button', {
      name: 'Play preview of Chelsea Hotel #2',
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByText('Song preview provided courtesy of iTunes.'),
  ).toBeVisible();
});

test('changing a place preserves a playing preview and changing the song clears it', async ({
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
  await page.goto('/portfolio/nyc-music-map');
  await expect(
    page.getByRole('button', {
      name: 'Select New York State of Mind by Billy Joel',
      exact: true,
    }),
  ).toBeEnabled();
  await page
    .getByRole('button', {
      name: 'Select New York State of Mind by Billy Joel',
      exact: true,
    })
    .press('Enter');
  await page
    .getByRole('button', {
      name: 'Play preview of New York State of Mind',
      exact: true,
    })
    .click();
  await expect
    .poll(() =>
      page
        .locator('audio')
        .evaluate((audio) => (audio as HTMLAudioElement).currentTime),
    )
    .toBeGreaterThan(0);
  const audio_src = await page.locator('audio').getAttribute('src');
  await page.getByRole('button', { name: 'Riverside', exact: true }).click();
  await expect(page.locator('audio')).toHaveAttribute('src', audio_src!);
  expect(
    await page
      .locator('audio')
      .evaluate((audio) => (audio as HTMLAudioElement).paused),
  ).toBe(false);
  await page
    .getByRole('button', { name: 'Show all places', exact: true })
    .click();
  await expect(page.locator('audio')).toHaveAttribute('src', audio_src!);
  expect(
    await page
      .locator('audio')
      .evaluate((audio) => (audio as HTMLAudioElement).paused),
  ).toBe(false);
  await approach_shelf(page);
  await page
    .getByRole('button', {
      name: 'Select New York State of Mind by Billy Joel',
      exact: true,
    })
    .click();
  await expect(
    page.getByRole('button', { name: /^Riverside: New York State of Mind/ }),
  ).toHaveClass(/is-selected/);
  await expect(
    page.getByRole('button', { name: 'Riverside', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('audio')).toHaveAttribute('src', audio_src!);
  expect(
    await page
      .locator('audio')
      .evaluate((audio) => (audio as HTMLAudioElement).paused),
  ).toBe(false);
  await approach_shelf(page);
  await page
    .getByRole('button', {
      name: 'Select Chelsea Hotel #2 by Leonard Cohen',
      exact: true,
    })
    .click();
  await expect(page.locator('audio')).not.toHaveAttribute('src');
});
