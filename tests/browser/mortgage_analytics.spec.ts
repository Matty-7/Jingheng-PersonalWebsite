import { test, expect } from '@playwright/test';
import { check_mortgage_analytics_surface } from '../../scripts/browser_checks/mortgage_analytics.mjs';

test('analytics concepts retain their formulas, distinctions and sources', async ({
  page,
}) => {
  await page.goto('/portfolio/mortgage-map');
  await check_mortgage_analytics_surface(page);
});

test('rate interaction, answer feedback and completion survive a reload', async ({
  page,
}) => {
  await page.goto('/portfolio/mortgage-map');
  await expect(page.locator('.mortgage-learning')).toHaveAttribute(
    'data-ready',
    'true',
  );
  const slider = page.getByRole('slider', { name: 'Try a different new rate' });
  await slider.press('End');
  await expect(page.locator('.learning-feedback')).toContainText(
    'Less incentive',
  );
  await slider.press('Home');
  await expect(page.locator('.learning-feedback')).toContainText(
    'Stronger incentive',
  );
  await page
    .getByRole('button', { name: 'Check understanding', exact: true })
    .click();
  await page
    .getByRole('button', {
      name: 'The coupon alone determines every payoff.',
      exact: true,
    })
    .click();
  await expect(page.locator('.learning-answer')).toContainText('Not quite');
  await expect(
    page.getByRole('button', { name: 'Mark understood & continue' }),
  ).toBeDisabled();
  await page
    .getByRole('button', {
      name: 'Borrowers face different costs and constraints.',
      exact: true,
    })
    .click();
  await page
    .getByRole('button', { name: 'Mark understood & continue', exact: true })
    .click();
  await expect(page.getByRole('heading', { level: 2 })).toHaveText(
    'Prepayments',
  );
  await expect(page.locator('[data-concept-id="incentive"]')).toHaveClass(
    /is-understood/,
  );
  await page.reload();
  await expect(page.getByRole('heading', { level: 2 })).toHaveText(
    'Prepayments',
  );
  await expect(page.locator('.learning-route-header')).toContainText(
    '1 of 5 understood',
  );
});

test('reflective lessons require revealing the authored explanation before self assessment', async ({
  page,
}) => {
  await page.goto('/portfolio/mortgage-map#concept=oas');
  await expect(page.getByRole('heading', { level: 2 })).toHaveText(
    'Option-adjusted spread',
  );
  await page
    .getByRole('textbox', { name: 'Your reasoning (optional)' })
    .fill('The embedded option changes the cash flows.');
  await page
    .getByRole('button', { name: 'Reveal explanation', exact: true })
    .click();
  await expect(page.locator('.learning-answer')).toBeVisible();
  await page
    .getByRole('button', { name: 'Mark understood & return', exact: true })
    .click();
  await expect(page.getByRole('heading', { level: 2 })).toHaveText(
    'When does refinancing make sense?',
  );
});
