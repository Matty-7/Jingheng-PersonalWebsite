import { test, expect } from '@playwright/test';

test('learning starts with a local tree and one focused activity', async ({
  page,
}) => {
  await page.goto('/portfolio/mortgage-map');
  await expect(page.locator('.mortgage-learning')).toHaveAttribute(
    'data-ready',
    'true',
  );
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Mortgage Map',
  );
  await expect(page.locator('.learning-tree button')).toHaveCount(6);
  await expect(page.getByRole('heading', { level: 2 })).toHaveText(
    'When does refinancing make sense?',
  );
  await expect(page.getByRole('button', { name: 'Map settings' })).toHaveCount(
    0,
  );
  await expect(
    page.getByRole('button', { name: 'Check understanding' }),
  ).toBeEnabled();
  await expect(page.locator('.learning-depth')).not.toHaveAttribute('open');
  await expect(page.locator('.is-understood')).toHaveCount(0);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth - innerWidth,
    ),
  ).toBe(0);
  if ((page.viewportSize()?.width ?? 0) > 800)
    await expect(
      page.getByRole('button', { name: 'Check understanding' }),
    ).toBeInViewport();
});

test('reduced motion keeps the same usable learning surface', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/portfolio/mortgage-map');
  await expect(page.locator('.learning-node').first()).toHaveCSS(
    'transition-duration',
    '0s',
  );
});
