import { test, expect } from '@playwright/test';

test('all domains and concepts remain available through one catalog', async ({
  page,
}) => {
  await page.goto('/portfolio/mortgage-map');
  await page.getByRole('button', { name: 'All topics', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.locator('.learning-domains > details')).toHaveCount(10);
  await dialog.getByText('Product families', { exact: true }).click();
  await expect(
    dialog.getByRole('button', { name: 'Corporate bonds', exact: true }),
  ).toBeVisible();
  await expect(
    dialog.getByRole('button', {
      name: 'Collateralized loan obligations',
      exact: true,
    }),
  ).toBeVisible();
  const search = page.getByRole('searchbox', {
    name: 'Search mortgage concepts',
  });
  await search.fill('IRS');
  await search.press('Enter');
  await expect(page.getByRole('heading', { level: 2 })).toHaveText(
    'Interest-rate swap',
  );
  await page.getByRole('button', { name: 'Search concepts' }).click();
  await search.fill('HELOC');
  await search.press('Enter');
  await expect(page.getByRole('heading', { level: 2 })).toContainText('HELOC');
  await page.reload();
  await expect(page.getByRole('heading', { level: 2 })).toContainText('HELOC');
  await page
    .getByRole('button', { name: 'Back to your learning path' })
    .click();
  await expect(page.getByRole('heading', { level: 2 })).toHaveText(
    'When does refinancing make sense?',
  );
});

test('existing cross-domain routes can become the active study path', async ({
  page,
}) => {
  await page.goto('/portfolio/mortgage-map#concept=lock_in');
  await expect(page.getByRole('heading', { level: 2 })).toHaveText(
    'Mortgage lock-in',
  );
  await page.getByText('Why it matters', { exact: true }).click();
  await expect(page.locator('.learning-formula')).toContainText('+400 bp');
  await page.getByRole('button', { name: 'View full tree' }).click();
  const dialog = page.getByRole('dialog');
  await dialog
    .getByRole('button', { name: 'Learning routes', exact: true })
    .click();
  await dialog
    .getByRole('button', { name: /From mortgage lock-in to MBS rate risk/ })
    .click();
  await expect(page.locator('.learning-route-header')).toContainText(
    'From mortgage lock-in to MBS rate risk',
  );
  await expect(page.getByRole('heading', { level: 2 })).toHaveText(
    'Mortgage lock-in',
  );
  await page
    .getByRole('button', { name: 'Housing turnover', exact: true })
    .click();
  await expect(page.getByRole('heading', { level: 2 })).toHaveText(
    'Housing turnover',
  );
  await expect(
    page.getByRole('button', { name: 'Back to your learning path' }),
  ).toBeVisible();
});
