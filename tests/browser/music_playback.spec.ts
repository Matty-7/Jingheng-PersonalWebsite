import { test, expect } from '@playwright/test';
import { mock_map, select_search, atlas_path } from './atlas_helpers';
test.beforeEach(async ({ page }) => mock_map(page));

test('failed preview leaves external links and a new selection is silent', async ({
  page,
}) => {
  await page.route('https://audio-ssl.itunes.apple.com/**', (route) =>
    route.abort(),
  );
  await page.goto(
    `${atlas_path}?entry=music%3Anew-york-state-of-mind%3Ariverside`,
  );
  await expect(page.getByRole('searchbox')).toBeEnabled();
  await page
    .getByRole('button', { name: 'Play preview of New York State of Mind' })
    .click();
  await expect(page.locator('.atlas-player output')).toContainText(
    'This preview is unavailable',
  );
  await expect(
    page.getByRole('link', { name: 'Listen on Apple Music', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Open in Google Maps' }),
  ).toBeVisible();
  await select_search(page, 'cornelia street');
  await expect(
    page.getByRole('button', { name: 'Play preview of Cornelia Street' }),
  ).toBeVisible();
  await expect(page.locator('audio')).not.toHaveAttribute('src');
});

test('same-recording place changes retain playback; a new recording stops it', async ({
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
    route.fulfill({ contentType: 'audio/wav', body: wav }),
  );
  await page.goto(
    `${atlas_path}?q=billy+joel&entry=music%3Anew-york-state-of-mind%3Achinatown`,
  );
  await expect(page.getByRole('searchbox')).toBeEnabled();
  await page
    .getByRole('button', { name: 'Play preview of New York State of Mind' })
    .click();
  const audio = page.locator('audio');
  await expect
    .poll(() =>
      audio.evaluate((element: HTMLAudioElement) => element.currentTime),
    )
    .toBeGreaterThan(0);
  const source = await audio.getAttribute('src');
  await page.getByRole('button', { name: /^Riverside:/ }).press('Enter');
  await expect(page.locator('.atlas-card h2')).toHaveText('Riverside');
  await expect(audio).toHaveAttribute('src', source!);
  await expect(audio).toHaveJSProperty('paused', false);
  await page.goBack();
  await expect(page.locator('.atlas-card h2')).toHaveText('Chinatown');
  await expect(audio).toHaveJSProperty('paused', false);
  await select_search(page, 'cornelia street');
  await expect(audio).not.toHaveAttribute('src');
  await expect(audio).toHaveJSProperty('paused', true);
});

test('a pending preview can be cancelled and cannot revive after closing the card', async ({
  page,
}) => {
  let release: () => void = () => {};
  let requests = 0;
  await page.route('https://audio-ssl.itunes.apple.com/**', async (route) => {
    requests++;
    await new Promise<void>((resolve) => {
      release = resolve;
    });
    await route.abort().catch(() => {});
  });
  await page.goto(
    `${atlas_path}?entry=music%3Acornelia-street%3Acornelia-street`,
  );
  await expect(page.getByRole('searchbox')).toBeEnabled();
  await page
    .getByRole('button', { name: 'Play preview of Cornelia Street' })
    .click();
  await expect.poll(() => requests).toBe(1);
  await page.getByRole('button', { name: 'Cancel loading preview' }).click();
  await expect(
    page.getByRole('button', { name: 'Play preview of Cornelia Street' }),
  ).toBeVisible();
  release();
  await page.getByRole('button', { name: 'Close place card' }).click();
  await expect(page.locator('audio')).not.toHaveAttribute('src');
  await expect(page.locator('audio')).toHaveJSProperty('paused', true);
});
