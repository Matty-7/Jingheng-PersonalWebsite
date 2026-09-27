import { test, expect } from '@playwright/test';
import { check_mortgage_focus_surface } from '../../scripts/browser_checks/mortgage_focus.mjs';

test('catalog traps focus, supports Escape and restores the originating control', async ({
  page,
}) => {
  await page.route(
    'https://static.cloudflareinsights.com/beacon.min.js',
    (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/javascript',
        body: '',
      }),
  );
  const page_errors: string[] = [];
  page.on('pageerror', (error) => page_errors.push(error.message));
  await page.goto('/portfolio/mortgage-map#concept=cpr');
  await expect(page.getByRole('heading', { level: 2 })).toHaveText('CPR');
  await check_mortgage_focus_surface(page);
  expect(page_errors).toEqual([]);
});
