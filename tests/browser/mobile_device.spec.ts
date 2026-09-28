import { test, expect } from '@playwright/test';
import { open_home } from './home_helpers';
import { mock_map } from './atlas_helpers';

test.use({ reducedMotion: 'reduce' });

test('device touch opens and closes a book, then plays and pauses a record', async ({
  page,
}) => {
  await open_home(page);
  expect(test.info().project.use.hasTouch).toBe(true);
  expect(test.info().project.use.isMobile).toBe(true);

  const first_book = page.locator('.bookshelf-book').first();
  await first_book.scrollIntoViewIfNeeded();
  await first_book.evaluate((element) => {
    element.addEventListener(
      'touchstart',
      (event) => {
        element.setAttribute('data-observed-touch', String(event.isTrusted));
      },
      { once: true },
    );
  });
  await first_book.tap();
  await expect(first_book).toHaveAttribute('data-observed-touch', 'true');
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

test('device touch filters Atlas and selects a unified place card', async ({
  page,
}) => {
  await mock_map(page);
  await page.goto(
    '/portfolio/new-york-atlas?entry=literature%3Awashington-square',
  );
  const music = page.getByRole('button', { name: 'Music', exact: true });
  await expect(music).toBeEnabled();
  await music.tap();
  await expect(page.locator('.atlas-card')).toHaveCount(0);
  await page.getByRole('searchbox').fill('cornelia street');
  await expect(page.locator('#atlas-search-hint')).toContainText('in Music');
  await page
    .getByRole('searchbox')
    .evaluate((input) => (input as HTMLInputElement).blur());
  await page.locator('.atlas-search-results button').first().tap();
  await expect(page.locator('.atlas-card')).toHaveAttribute(
    'data-medium',
    'music',
  );
  await page.getByRole('button', { name: 'Sources and place details' }).tap();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: 'Close details' }).tap();
  await page.getByRole('button', { name: 'Close place card' }).tap();
  await expect(page.locator('.atlas-card')).toHaveCount(0);
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth <= innerWidth &&
        document.documentElement.scrollHeight <= innerHeight + 1,
    ),
  ).toBe(true);
});
