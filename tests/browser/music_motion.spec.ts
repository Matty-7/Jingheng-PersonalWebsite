import { test, expect } from '@playwright/test';
import { approach_shelf } from './music_helpers';

test('album motion advances faster without playing and honors Pause and reduced motion', async ({
  page,
}) => {
  await page.clock.install({ time: new Date('2026-01-01T00:00:00Z') });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/portfolio/nyc-music-map');
  const shelf = page.locator('.sound-shelf');
  await expect
    .poll(() => shelf.evaluate((element) => element.scrollLeft))
    .toBeGreaterThan(4);
  // Measure animation speed independently of CI frame scheduling.
  await page.clock.pauseAt(new Date('2026-01-01T01:00:00Z'));
  const speed_start = await shelf.evaluate((element) => element.scrollLeft);
  await page.clock.runFor(600);
  expect(await shelf.evaluate((element) => element.scrollLeft)).toBeGreaterThan(
    speed_start + 14,
  );
  await page.clock.resume();
  await page
    .getByRole('button', { name: 'Pause album scrolling', exact: true })
    .click();
  const stopped = await shelf.evaluate((element) => element.scrollLeft);
  await page.waitForTimeout(250);
  expect(await shelf.evaluate((element) => element.scrollLeft)).toBe(stopped);
  await page
    .getByRole('button', { name: 'Resume album scrolling', exact: true })
    .click();
  await expect
    .poll(() => shelf.evaluate((element) => element.scrollLeft))
    .toBeGreaterThan(stopped + 3);
  await page.getByRole('button', { name: 'More songs', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Pause album scrolling', exact: true }),
  ).toBeVisible();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(
    page.getByRole('button', {
      name: 'Album scrolling off: reduced motion',
      exact: true,
    }),
  ).toBeDisabled();
  await expect(page.locator('audio')).not.toHaveAttribute('src');
});

test('album motion pauses for hover, focus and touch, and reverses at the end', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/portfolio/nyc-music-map');
  const shelf = page.locator('.sound-shelf');
  const position = () => shelf.evaluate((element) => element.scrollLeft);
  await expect.poll(position).toBeGreaterThan(3);
  await shelf.hover();
  const hovered = await position();
  await page.waitForTimeout(200);
  expect(await position()).toBe(hovered);
  await page.mouse.move(0, 0);
  await expect.poll(position).toBeGreaterThan(hovered + 2);
  await page
    .getByRole('button', {
      name: 'Select Bushwick Blues by Delta Spirit',
      exact: true,
    })
    .press('ArrowRight');
  await page.waitForTimeout(150);
  const focused = await position();
  await page.waitForTimeout(200);
  expect(await position()).toBe(focused);
  await page
    .getByRole('button', { name: 'Show all places', exact: true })
    .focus();
  await expect.poll(position).toBeGreaterThan(focused + 2);
  await shelf.dispatchEvent('pointerdown', {
    pointerType: 'touch',
    pointerId: 10,
    bubbles: true,
  });
  await expect(
    page.getByRole('button', { name: 'Pause album scrolling', exact: true }),
  ).toBeVisible();
  await shelf.evaluate((element) => {
    element.scrollLeft = element.scrollWidth;
  });
  const end = await position();
  await shelf.dispatchEvent('pointerup', {
    pointerType: 'touch',
    pointerId: 10,
    bubbles: true,
  });
  await expect.poll(position).toBeLessThan(end - 2);
  await expect(page.locator('audio')).not.toHaveAttribute('src');
});

test('manual wheel and arrow browsing resume automatically while the pointer stays over the shelf', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/portfolio/nyc-music-map');
  const shelf = page.locator('.sound-shelf');
  const position = () => shelf.evaluate((element) => element.scrollLeft);
  await approach_shelf(page);
  await shelf.locator('button').first().click();
  await shelf.hover();
  const before = await position();
  await page.mouse.wheel(260, 0);
  await expect.poll(position).toBeGreaterThan(before + 100);
  await page.waitForTimeout(400);
  const manual = await position();
  await page.waitForTimeout(1000);
  expect(Math.abs((await position()) - manual)).toBeLessThan(2);
  await expect.poll(position, { timeout: 4500 }).toBeGreaterThan(manual + 8);
  await page.getByRole('button', { name: 'More songs', exact: true }).click();
  await page.waitForTimeout(800);
  const arrow = await position();
  await expect.poll(position, { timeout: 4500 }).toBeGreaterThan(arrow + 8);
  await page
    .getByRole('button', { name: 'Pause album scrolling', exact: true })
    .click();
  await shelf.hover();
  await page.mouse.wheel(180, 0);
  await page.waitForTimeout(500);
  const paused = await position();
  await page.waitForTimeout(2300);
  expect(await position()).toBe(paused);
  await expect(
    page.getByRole('button', { name: 'Resume album scrolling', exact: true }),
  ).toBeVisible();
});

test('synthetic held touch and trailing scroll events postpone automatic motion until idle', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/portfolio/nyc-music-map');
  const shelf = page.locator('.sound-shelf');
  const position = () => shelf.evaluate((element) => element.scrollLeft);
  const initial = await position();
  await expect.poll(position).toBeGreaterThan(initial + 8);
  await shelf.dispatchEvent('pointerdown', {
    pointerType: 'touch',
    pointerId: 11,
    bubbles: true,
  });
  await shelf.evaluate((element) => {
    element.scrollLeft = 250;
  });
  await expect.poll(position).toBe(250);
  const held = await position();
  await page.waitForTimeout(2200);
  expect(await position()).toBe(held);
  await shelf.dispatchEvent('pointerup', {
    pointerType: 'touch',
    pointerId: 11,
    bubbles: true,
  });
  await page.waitForTimeout(1200);
  await shelf.evaluate((element) => {
    element.scrollLeft += 80;
  });
  await page.waitForTimeout(100);
  const trailing = await position();
  await page.waitForTimeout(1100);
  expect(await position()).toBe(trailing);
  await expect.poll(position, { timeout: 4000 }).toBeGreaterThan(trailing + 8);
  await expect(page.locator('audio')).not.toHaveAttribute('src');
});
