import { test, expect } from '@playwright/test';
import { check_mortgage_focus_surface } from '../../scripts/browser_checks/mortgage_focus.mjs';

test('concept reading preserves focus, scroll and staged Escape', async ({
  page,
}) => {
  const page_errors: string[] = [];
  page.on('pageerror', (error) => page_errors.push(error.message));
  await page.route('**/*', (route) => {
    const url = new URL(route.request().url());
    return url.origin === 'http://127.0.0.1:4173'
      ? route.continue()
      : route.abort();
  });
  // The reader opens from the URL only after hydration has completed.
  await page.goto('/portfolio/mortgage-map#concept=cpr');
  await expect(
    page
      .getByRole('complementary', { name: 'Concept reader' })
      .getByRole('heading', { name: 'CPR', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('searchbox', { name: 'Search mortgage concepts' }),
  ).toBeVisible();
  const viewport =
    (await page.evaluate(() => innerWidth)) <= 800 ? 'mobile' : 'desktop';
  await check_mortgage_focus_surface(page, viewport);
  expect(page_errors).toEqual([]);
});
