import { test, expect } from '@playwright/test';

test.use({ javaScriptEnabled: false });

test.beforeEach(async ({ page }) => {
  await page.route('https://www.google.com/maps/embed/**', (route) =>
    route.fulfill({
      contentType: 'text/html',
      body: '<title>Map fixture</title>',
    }),
  );
});

test('Atlas, music and literature deep links render their requested selection without JavaScript', async ({
  page,
}) => {
  await page.goto(
    '/portfolio/new-york-atlas?medium=music&q=billy+joel&entry=music%3Anew-york-state-of-mind%3Ariverside',
  );
  await expect(page.locator('.atlas-place-heading h2')).toHaveText('Riverside');
  await expect(page.locator('.atlas-work-heading h3')).toHaveText(
    'New York State of Mind',
  );
  await expect(page.locator('.atlas-detail')).toHaveAttribute(
    'data-medium',
    'music',
  );
  await expect(page.getByRole('searchbox')).toHaveValue('billy joel');

  await page.goto(
    '/portfolio/nyc-music-map?track=cornelia-street&place=cornelia-street',
  );
  await expect(
    page
      .getByRole('article', { name: 'Selected song' })
      .getByRole('heading', { level: 2 }),
  ).toHaveText('Cornelia Street');
  await expect(page.locator('.sound-map-panel iframe')).toHaveAttribute(
    'title',
    /Cornelia Street/,
  );

  await page.goto(
    '/portfolio/nyc-literary-map?work=gatsby&passage=queensboro-bridge',
  );
  await expect(
    page.getByRole('article').getByRole('heading', { level: 2 }),
  ).toHaveText('Queensboro Bridge');

  await page.goto(
    '/portfolio/new-york-atlas?medium=unknown&q=no-such-work-xyz&entry=invalid',
  );
  await expect(
    page.getByRole('heading', { name: 'No connections found.' }),
  ).toBeVisible();
  await expect(page.locator('iframe')).toHaveCount(0);
});
