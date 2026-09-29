import { test, expect } from '@playwright/test';

for (const reduced_motion of ['no-preference', 'reduce'] as const) {
  test(`burnout distinguishes selection from age and constraints (${reduced_motion})`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: reduced_motion });
    await page.goto('/portfolio/mortgage-map?concept=burnout#concept=burnout');
    await expect(page.getByRole('heading', { level: 2 })).toHaveText('Burnout');
    await page.getByText('Why it matters', { exact: true }).press('Enter');
    const depth = page.locator('.learning-depth');
    await expect(depth).toContainText('Low CPR or high WALA alone');
    await expect(depth).toContainText('without undoing past selection');
    await expect(depth.getByRole('link')).toHaveCount(2);
    const choices = page.getByRole('group', { name: 'Choose an answer' });
    await choices.getByRole('button', { name: /^Yes\. Low CPR/ }).click();
    await expect(page.locator('.learning-answer')).toContainText('Not quite');
    await expect(
      page.getByRole('button', { name: 'Mark understood & continue' }),
    ).toBeDisabled();
    await choices
      .getByRole('button', { name: /^No\. Check past/ })
      .press('Enter');
    await expect(page.locator('.learning-answer')).toContainText(
      'That’s right',
    );
    await expect(
      page.getByRole('button', { name: 'Mark understood & continue' }),
    ).toBeEnabled();
    await depth.getByRole('button', { name: 'WALA', exact: true }).click();
    await expect(page.getByRole('heading', { level: 2 })).toHaveText('WALA');
    await page.goBack();
    await expect(page.getByRole('heading', { level: 2 })).toHaveText('Burnout');
    await page.reload();
    await expect(page.getByRole('heading', { level: 2 })).toHaveText('Burnout');
    await page.getByText('Why it matters', { exact: true }).press('Enter');
    await expect(depth).toContainText('improved home equity');
    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth,
    );
    expect(overflow).toBe(false);
  });
}

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
  await expect(dialog).toHaveCount(0);
  await expect(page.getByRole('heading', { level: 2 })).toHaveText(
    'Interest-rate swap',
  );
  await page.getByRole('button', { name: 'Search concepts' }).click();
  await search.fill('HELOC');
  await expect(
    dialog.locator('.learning-search-results button').first(),
  ).toBeVisible();
  await search.press('Enter');
  await expect(dialog).toHaveCount(0);
  await expect(page.getByRole('heading', { level: 2 })).toContainText('HELOC');
  await page.reload();
  await expect(page.getByRole('heading', { level: 2 })).toContainText('HELOC');
  await page.goto('/portfolio/mortgage-map');
  await expect(page.getByRole('heading', { level: 2 })).toContainText('HELOC');
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
  await page.getByRole('button', { name: 'All topics', exact: true }).click();
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
    .getByRole('navigation', { name: 'Local learning tree' })
    .getByRole('button', { name: 'Housing turnover', exact: true })
    .click();
  await expect(page.getByRole('heading', { level: 2 })).toHaveText(
    'Housing turnover',
  );
  await expect(
    page.getByRole('button', { name: 'Back to your learning path' }),
  ).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole('heading', { level: 2 })).toHaveText(
    'Housing turnover',
  );
  await expect(page.locator('.learning-route-header')).toContainText(
    'From mortgage lock-in to MBS rate risk',
  );
});
