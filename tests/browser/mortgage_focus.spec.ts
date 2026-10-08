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

test('completion-opened catalog returns focus to the active completion control', async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem(
      'mortgage-map-learning-v1',
      JSON.stringify({
        route_id: 'borrower_decision',
        current_id: 'cash_flows',
        completed: [
          'principal_interest',
          'fixed_arm',
          'incentive',
          'prepayments',
        ],
      }),
    ),
  );
  await page.goto(
    '/portfolio/mortgage-map?concept=cash_flows#concept=cash_flows',
  );
  await expect(page.getByRole('heading', { level: 2 })).toHaveText(
    'Cash-flow components',
  );
  await page
    .getByRole('button', {
      name: 'No. One scenario does not by itself specify outcomes and their probabilities.',
      exact: true,
    })
    .click();
  await page
    .getByRole('button', {
      name: 'Mark understood & continue',
      exact: true,
    })
    .click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await page
    .getByRole('searchbox', { name: 'Search mortgage concepts' })
    .press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(
    page.getByRole('button', { name: 'Continue learning', exact: true }),
  ).toBeFocused();
});
