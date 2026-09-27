import { test, expect } from '@playwright/test';
import { learning_checks } from '../../lib/mortgage_learning';

test('dollar-roll explanation, formula, sources and connections remain available on demand', async ({
  page,
}) => {
  await page.goto('/portfolio/mortgage-map#concept=rolls');
  await expect(page.getByRole('heading', { level: 2 })).toHaveText(
    'Dollar rolls',
  );
  await page.getByText('Why it matters', { exact: true }).click();
  await expect(page.locator('.learning-depth')).toContainText(
    'not a 0.25% investment return',
  );
  await expect(page.locator('.learning-depth .katex-mathml')).toHaveCount(1);
  await expect(page.locator('.learning-sources a').first()).toBeVisible();
  await page
    .getByRole('button', {
      name: learning_checks.rolls.choices[learning_checks.rolls.correct],
      exact: true,
    })
    .click();
  await expect(page.locator('.learning-answer')).toContainText(
    'Forgone payments can outweigh the drop and any funding benefit',
  );
  await page
    .locator('.learning-related')
    .getByRole('button', { name: 'Repurchase financing', exact: true })
    .click();
  await expect(page.getByRole('heading', { level: 2 })).toHaveText(
    'Repurchase financing',
  );
  await page.goBack();
  await expect(page.getByRole('heading', { level: 2 })).toHaveText(
    'Dollar rolls',
  );
  await page.reload();
  await expect(page.getByRole('heading', { level: 2 })).toHaveText(
    'Dollar rolls',
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth - innerWidth,
    ),
  ).toBe(0);
});
