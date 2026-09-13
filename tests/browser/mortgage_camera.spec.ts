import { test, expect } from '@playwright/test';

test.use({ reducedMotion: 'reduce' });

test('camera pans, zooms, fits and recenters after reader and view changes', async ({
  page,
}) => {
  await page.goto('/portfolio/mortgage-map#concept=cpr');
  await expect(
    page.getByRole('complementary', { name: 'Concept reader' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Map', exact: true }).click();
  const canvas = page.getByRole('application');
  const transform = () =>
    page.locator('.atlas-world').evaluate((el) => {
      const m = new DOMMatrix(getComputedStyle(el).transform);
      return { x: m.e, y: m.f, scale: m.a };
    });
  await page.getByRole('button', { name: 'Fit map', exact: true }).click();
  const fitted = await transform();
  await canvas.press('ArrowRight');
  await expect
    .poll(async () => (await transform()).x)
    .toBeCloseTo(fitted.x - 90, 1);
  await canvas.press('+');
  await expect
    .poll(async () => (await transform()).scale)
    .toBeGreaterThan(fitted.scale);
  await canvas.press('Home');
  await expect.poll(transform).toEqual(fitted);
  const selected = page.locator('[data-node-id="cpr"]');
  async function expect_centered() {
    await expect
      .poll(async () => {
        const node = await selected.boundingBox(),
          frame = await canvas.boundingBox();
        return Math.max(
          Math.abs(node!.x + node!.width / 2 - frame!.x - frame!.width / 2),
          Math.abs(node!.y + node!.height / 2 - frame!.y - frame!.height / 2),
        );
      })
      .toBeLessThan(2);
  }
  await page.getByRole('button', { name: 'Focus selected concept' }).click();
  await expect_centered();
  await page.getByRole('button', { name: 'Close concept reader' }).click();
  await expect_centered();
  await page.getByRole('button', { name: 'List', exact: true }).click();
  await expect(canvas).toHaveCount(0);
  await page.getByRole('button', { name: 'Map', exact: true }).click();
  await page.getByRole('button', { name: 'Focus selected concept' }).click();
  await expect_centered();
  await page.getByRole('button', { name: 'Expand map', exact: true }).click();
  await expect_centered();
  await page
    .getByRole('button', { name: 'Exit expanded map', exact: true })
    .click();
  await expect_centered();
});
