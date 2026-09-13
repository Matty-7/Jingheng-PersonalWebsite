import { test, expect } from '@playwright/test';
import music from '../../content/music.json' with { type: 'json' };
import { open_home } from './home_helpers';

test.use({ reducedMotion: 'reduce' });

test('records play, pause, wrap and keep one audio element across sections', async ({
  page,
}) => {
  await open_home(page);
  const audio = page.locator('audio');
  const records = page.locator('#records');
  const mini = page.getByRole('complementary', { name: 'Current record' });
  await expect(audio).toHaveCount(1);
  expect(await audio.getAttribute('src')).toBeNull();
  expect(await audio.evaluate((el) => (el as HTMLAudioElement).paused)).toBe(
    true,
  );
  await expect(mini).toHaveCount(0);

  await records.getByRole('button', { name: /^Play preview of / }).click();
  await expect
    .poll(() => audio.evaluate((el) => (el as HTMLAudioElement).currentTime))
    .toBeGreaterThan(0.3);
  await expect
    .poll(() => records.getByRole('progressbar').getAttribute('value'))
    .not.toBe('0');
  await expect(
    records.getByRole('button', { name: 'Pause preview', exact: true }),
  ).toBeVisible();
  const original_audio = await audio.elementHandle();
  await page
    .locator('.home-nav')
    .getByRole('link', { name: 'Book', exact: true })
    .click();
  await expect(mini).toBeInViewport();
  expect(
    await original_audio!.evaluate(
      (el) => el.isConnected && el === document.querySelector('audio'),
    ),
  ).toBe(true);
  await mini.getByRole('button', { name: 'Pause preview' }).click();
  expect(await audio.evaluate((el) => (el as HTMLAudioElement).paused)).toBe(
    true,
  );
  const paused_at = await audio.evaluate(
    (el) => (el as HTMLAudioElement).currentTime,
  );
  // Observe a paused media clock across a real interval, not only its flag.
  await page.waitForTimeout(300);
  expect(
    await audio.evaluate((el) => (el as HTMLAudioElement).currentTime),
  ).toBeCloseTo(paused_at, 2);
  await mini.getByRole('button', { name: 'Resume preview' }).click();
  await expect
    .poll(() => audio.evaluate((el) => (el as HTMLAudioElement).currentTime))
    .toBeGreaterThan(paused_at + 0.2);
  await mini.getByRole('button', { name: 'Next record' }).click();
  await expect(records.getByRole('heading', { level: 3 })).toHaveText(
    music[1].trackName,
  );
  await expect(audio).toHaveAttribute('data-track', '1');

  await records
    .getByRole('button', {
      name: `Play preview: ${music[0].trackName} by ${music[0].displayArtist}`,
      exact: true,
    })
    .click();
  await records.getByRole('button', { name: 'Previous record' }).click();
  await expect(audio).toHaveAttribute('data-track', '9');
  await expect(records.getByRole('heading', { level: 3 })).toHaveText(
    music[9].trackName,
  );
  await records
    .getByRole('button', { name: 'Next record', exact: true })
    .click();
  await expect(audio).toHaveAttribute('data-track', '0');
  await expect
    .poll(() => audio.evaluate((el) => (el as HTMLAudioElement).currentTime))
    .toBeGreaterThan(0.2);
  await expect(audio).toHaveCount(1);
});

test('unavailable preview offers the full song and another record can recover', async ({
  page,
}) => {
  await open_home(page, music[0].previewUrl);
  const records = page.locator('#records');
  await records.getByRole('button', { name: /^Play preview of / }).click();
  await expect(records.locator('.playback-message')).toContainText(
    'unavailable',
  );
  await expect(
    records.getByRole('link', { name: 'Full song on Apple Music' }),
  ).toHaveAttribute('href', music[0].appleMusicUrl);
  await expect(
    records.getByRole('button', { name: /^Play preview of / }),
  ).toBeVisible();
  await records
    .getByRole('button', { name: 'Next record', exact: true })
    .click();
  await expect
    .poll(() =>
      page
        .locator('audio')
        .evaluate((el) => (el as HTMLAudioElement).currentTime),
    )
    .toBeGreaterThan(0.2);
  await expect(records.locator('.playback-message')).toHaveCount(0);
});
