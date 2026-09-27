import { test, expect } from '@playwright/test';

test('learning works without panning or zooming and fits narrow screens', async ({
  page,
}) => {
  await page.goto('/portfolio/mortgage-map');
  await expect(page.locator('.mortgage-learning')).toHaveAttribute(
    'data-ready',
    'true',
  );
  await expect(page.getByRole('button', { name: 'Zoom in' })).toHaveCount(0);
  await page
    .getByRole('button', { name: 'Principal & interest', exact: true })
    .press('Enter');
  await expect(page.getByRole('heading', { level: 2 })).toBeFocused();
  await expect(page.getByRole('heading', { level: 2 })).toHaveText(
    'Principal & interest',
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth - innerWidth,
    ),
  ).toBe(0);
  await page
    .getByRole('button', { name: 'Refinancing incentive', exact: true })
    .press('Enter');
  await expect(page.getByRole('slider')).toBeVisible();
});
