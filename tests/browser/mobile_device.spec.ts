import { test, expect } from '@playwright/test';
import { open_home } from './home_helpers';

test.use({ reducedMotion: 'reduce' });

test('device touch opens and closes a book, then plays and pauses a record', async ({
  page,
}) => {
  await open_home(page);
  expect(await page.evaluate(() => navigator.maxTouchPoints)).toBeGreaterThan(
    0,
  );
  expect(
    await page.evaluate(() => matchMedia('(pointer: coarse)').matches),
  ).toBe(true);

  const first_book = page.locator('.bookshelf-book').first();
  await first_book.scrollIntoViewIfNeeded();
  await first_book.tap();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('dialog').getByRole('button', { name: 'Close' }).tap();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.locator('.book-drag-ghost')).toHaveCount(0);

  const records = page.locator('#records');
  const play = records.getByRole('button', { name: /^Play preview of / });
  await play.scrollIntoViewIfNeeded();
  await play.tap();
  await expect
    .poll(() =>
      page
        .locator('audio')
        .evaluate((el) => (el as HTMLAudioElement).currentTime),
    )
    .toBeGreaterThan(0.2);
  await records
    .getByRole('button', { name: 'Pause preview', exact: true })
    .tap();
  expect(
    await page
      .locator('audio')
      .evaluate((el) => (el as HTMLAudioElement).paused),
  ).toBe(true);
  await expect(page.locator('audio')).toHaveCount(1);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test('device touch changes Atlas medium and opens its selected collection', async ({
  page,
}) => {
  await page.route('https://www.google.com/maps/embed/**', (route) =>
    route.fulfill({
      contentType: 'text/html',
      body: '<title>Map fixture</title>',
    }),
  );
  await page.goto(
    '/portfolio/new-york-atlas?medium=literature&entry=literature%3Awashington-square',
  );
  const music = page
    .locator('.atlas-filters')
    .getByRole('button', { name: /^Music/ });
  await expect(music).toBeEnabled();
  await music.tap();
  await expect(page.locator('.atlas-detail')).toHaveAttribute(
    'data-medium',
    'music',
  );
  await expect(
    page.getByRole('combobox', { name: 'Choose a work and place' }),
  ).toBeVisible();
  const collection = page.getByRole('link', {
    name: 'View in the music collection',
  });
  await collection.scrollIntoViewIfNeeded();
  await collection.tap();
  await expect(
    page.getByRole('heading', { name: 'NYC Music Map.' }),
  ).toBeVisible();
  await expect(page.locator('audio')).toHaveCount(1);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
