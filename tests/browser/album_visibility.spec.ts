import { test, expect } from '@playwright/test';

test.use({ reducedMotion: 'no-preference' });

test('album motion stops offscreen and resumes when the shelf returns', async ({
  page,
}) => {
  const viewport = page.viewportSize();
  if (!viewport) throw new Error('This scenario requires a viewport.');
  // A tall desktop viewport can still show the shelf at the end of this page.
  await page.setViewportSize({
    ...viewport,
    height: Math.min(viewport.height, 600),
  });
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
