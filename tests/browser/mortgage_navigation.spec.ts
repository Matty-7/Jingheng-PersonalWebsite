import { test, expect } from '@playwright/test';

test('free jumps become the saved lesson and support native browser history', async ({
  page,
}) => {
  await page.goto('/portfolio/mortgage-map');
  await expect(page.locator('.mortgage-learning')).toHaveAttribute(
    'data-ready',
    'true',
  );
  await page.getByRole('button', { name: 'Prepayments', exact: true }).click();
  await expect(page.getByRole('heading', { level: 2 })).toHaveText(
    'Prepayments',
  );
  await page.goBack();
  await expect(page.getByRole('heading', { level: 2 })).toHaveText(
    'When does refinancing make sense?',
  );
  await page.goForward();
  await expect(page.getByRole('heading', { level: 2 })).toHaveText(
    'Prepayments',
  );
  await expect(
    page.getByRole('button', {
      name: /Learn from here|Back to your learning path|View full tree/,
    }),
  ).toHaveCount(0);
  await page.goto('/portfolio/mortgage-map');
  await expect(page.getByRole('heading', { level: 2 })).toHaveText(
    'Prepayments',
  );
});
