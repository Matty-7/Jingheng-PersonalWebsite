import { test, expect } from '@playwright/test';

test.use({ reducedMotion: 'no-preference' });

test('album motion stops offscreen and resumes when the shelf returns', async ({
  page,
}) => {
  await page.route('https://www.google.com/maps/embed/**', (route) =>
    route.fulfill({
      contentType: 'text/html',
      body: '<title>Map fixture</title>',
    }),
  );
  await page.goto('/portfolio/nyc-music-map');
  const shelf = page.locator('.sound-shelf');
  await shelf.scrollIntoViewIfNeeded();
  await page.mouse.move(0, 0);
  const position = () => shelf.evaluate((el) => el.scrollLeft);
  await expect.poll(position).toBeGreaterThan(4);
  await page.locator('.sound-footnote').scrollIntoViewIfNeeded();
  await expect(shelf).not.toBeInViewport();
  // Allow the visibility callback to run before measuring a stopped interval.
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
  );
  const stopped = await position();
  await page.waitForTimeout(350);
  expect(await position()).toBe(stopped);
  await shelf.scrollIntoViewIfNeeded();
  await expect.poll(position).toBeGreaterThan(stopped + 4);
});
