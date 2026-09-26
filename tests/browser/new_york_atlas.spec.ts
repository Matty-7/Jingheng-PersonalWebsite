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
  const layout = await page.evaluate(() => ({
    width: innerWidth,
    workspace_top: document
      .querySelector('.atlas-workspace')!
      .getBoundingClientRect().top,
    map_top: document.querySelector('.atlas-map')!.getBoundingClientRect().top,
  }));
  if (layout.width > 800) expect(layout.workspace_top).toBeLessThanOrEqual(250);
  else expect(layout.map_top).toBeLessThanOrEqual(400);
  const visiting = page.locator('.atlas-visiting');
  await expect(visiting.locator('p')).not.toBeVisible();
  await visiting.locator('summary').press('Enter');
  await expect(visiting.locator('p')).toBeVisible();
  await expect(visiting.locator('p')).toContainText(
    'West 90th and 91st Streets',
  );
  await visiting.locator('summary').press('Enter');
  await expect(visiting.locator('p')).not.toBeVisible();
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
  const sources = page.locator('.atlas-story details');
  await sources.locator('summary').press('Enter');
  await expect(sources.getByRole('link').first()).toBeVisible();
  await page
    .getByRole('link', { name: 'View in the film & tv collection' })
    .click();
  await expect(
    page.getByRole('combobox', { name: 'Choose a filming location' }),
  ).toHaveValue('cafe-lalo');
  await page.getByRole('link', { name: '← New York Atlas' }).click();
  await expect(
    page.getByRole('heading', { name: 'New York Atlas.' }),
  ).toBeVisible();
});

test('TV creators, years and screen deep links work in both collections', async ({
  page,
}) => {
  await page.goto('/portfolio/new-york-atlas?medium=film');
  await expect(
    page.getByRole('button', { name: /^Film & TV/ }),
  ).toHaveAttribute('aria-pressed', 'true');
  const search = page.getByRole('searchbox', { name: 'Search the atlas' });
  await expect(search).toBeEnabled();
  await search.fill('Marta Kauffman');
  await expect(page.locator('.atlas-work-heading h3')).toHaveText('Friends');
  await expect(page.locator('.atlas-work-heading')).toContainText(
    'TV series · 1994–2004',
  );
  await expect(page.locator('.atlas-work-heading')).toContainText('Created by');
  await expect(page.locator('.atlas-work-heading')).toContainText(
    'Marta Kauffman',
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  const collection = page.getByRole('link', {
    name: 'View in the film & tv collection',
  });
  const destination = new URL(
    (await collection.getAttribute('href'))!,
    page.url(),
  );
  await collection.press('Enter');
  await expect(
    page.getByRole('heading', { name: 'NYC Film & TV Map.' }),
  ).toBeVisible();
  await expect(
    page.getByRole('combobox', { name: 'Choose a filming location' }),
  ).toHaveValue(destination.searchParams.get('place')!);
  await expect(
    page.getByRole('button', { name: 'Friends 1994–2004', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.cinema-list-heading')).toContainText(
    'Created by',
  );
  await page
    .getByRole('searchbox', { name: 'Search titles, creators or places' })
    .fill('David Crane');
  await expect(
    page.getByRole('button', { name: 'Friends 1994–2004', exact: true }),
  ).toBeVisible();
  await expect(page.locator('.cinema-collection-label')).toContainText(
    '32 films · 6 series',
  );
  await page.goBack();
  await expect(search).toHaveValue('Marta Kauffman');
  await expect(page.locator('.atlas-work-heading h3')).toHaveText('Friends');
});
