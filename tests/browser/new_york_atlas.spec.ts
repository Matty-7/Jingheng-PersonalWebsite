import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('https://www.google.com/maps/embed/**', (route) =>
    route.fulfill({
      contentType: 'text/html',
      body: '<!doctype html><title>Map fixture</title>',
    }),
  );
});

test('Atlas unifies search and filters, preserves empty state and mobile layout', async ({
  page,
}) => {
  await page.goto('/portfolio/new-york-atlas');
  await expect(
    page.getByRole('heading', { name: 'New York Atlas.' }),
  ).toBeVisible();
  await expect(page.locator('.atlas-map iframe')).toHaveCount(1);
  const search = page.getByRole('searchbox', { name: 'Search the atlas' });
  await expect(search).toBeEnabled();
  await search.fill('henry james');
  await expect(page.locator('.atlas-detail')).toContainText(
    'Washington Square',
  );
  await expect(page.locator('.atlas-story blockquote')).toContainText(
    'white marble steps',
  );
  await page
    .locator('.atlas-filters')
    .getByRole('button', { name: /^Music/ })
    .click();
  await expect(
    page.getByRole('heading', { name: 'No connections found.' }),
  ).toBeVisible();
  await expect(page.locator('iframe')).toHaveCount(0);
  await expect(page.locator('.atlas-place-heading')).toHaveCount(0);
  await page.getByRole('button', { name: 'Reset filters' }).click();
  await expect(search).toHaveValue('');
  await expect(page.locator('.atlas-map iframe')).toHaveCount(1);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await expect(page.locator('audio')).toHaveCount(1);
  await expect(page.locator('audio')).not.toHaveAttribute('src');
});

test('related works cross categories with distinct pins and reversible history', async ({
  page,
}) => {
  await page.goto(
    '/portfolio/new-york-atlas?medium=literature&entry=literature%3Awashington-square&utm_source=test',
  );
  await expect(page.locator('.atlas-location-note')).toContainText(
    'not an identified address',
  );
  await expect(page.getByRole('searchbox')).toBeEnabled();
  const original_url = page.url();
  const related = page.getByRole('region', { name: 'Related works' });
  await related
    .getByRole('button')
    .filter({ hasText: 'Washington Square Arch' })
    .first()
    .press('Enter');
  await expect(page.locator('.atlas-place-heading h2')).toHaveText(
    'Washington Square Arch',
  );
  await expect(page.locator('.atlas-detail')).toHaveAttribute(
    'data-medium',
    'film',
  );
  await expect(page.locator('.atlas-still img')).toHaveCount(1);
  expect(new URL(page.url()).searchParams.get('utm_source')).toBe('test');
  await page.goBack();
  await expect(page).toHaveURL(original_url);
  await expect(page.locator('.atlas-detail')).toHaveAttribute(
    'data-medium',
    'literature',
  );
  await page.reload();
  await expect(page.locator('.atlas-location-note')).toContainText(
    'not an identified address',
  );
  await page.goForward();
  await expect(page.locator('.atlas-place-heading h2')).toHaveText(
    'Washington Square Arch',
  );
});

test('music preview stays user initiated and failure leaves music and location links', async ({
  page,
}) => {
  await page.route('https://audio-ssl.itunes.apple.com/**', (route) =>
    route.abort(),
  );
  await page.goto(
    '/portfolio/new-york-atlas?medium=music&q=billy+joel&entry=music%3Anew-york-state-of-mind%3Ariverside',
  );
  await expect(page.locator('.atlas-place-heading h2')).toHaveText('Riverside');
  await expect(page.locator('audio')).not.toHaveAttribute('src');
  await page
    .getByRole('button', { name: 'Play preview of New York State of Mind' })
    .click();
  await expect(page.locator('.atlas-player output')).toContainText(
    'This preview is unavailable',
  );
  await expect(
    page.getByRole('link', { name: 'Listen on Apple Music' }),
  ).toBeVisible();
  await expect(page.locator('.atlas-place-heading a')).toHaveAttribute(
    'href',
    /maps\/search/,
  );
  await page
    .locator('.atlas-filters')
    .getByRole('button', { name: /^Film/ })
    .click();
  await expect(page.locator('audio')).not.toHaveAttribute('src');
  await expect(page.locator('iframe')).toHaveCount(0);
});

test('Atlas links to an intact specialized collection and comes back', async ({
  page,
}) => {
  await page.goto('/portfolio/new-york-atlas?medium=film&q=cafe+lalo');
  await expect(page.locator('.atlas-place-heading h2')).toHaveText('Café Lalo');
  await page.getByRole('link', { name: 'View in the film collection' }).click();
  await expect(
    page.getByRole('combobox', { name: 'Choose a filming location' }),
  ).toHaveValue('cafe-lalo');
  await page.getByRole('link', { name: '← New York Atlas' }).click();
  await expect(
    page.getByRole('heading', { name: 'New York Atlas.' }),
  ).toBeVisible();
});
