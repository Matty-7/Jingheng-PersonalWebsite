import { test, expect } from '@playwright/test';
import { mock_map, atlas_path } from './atlas_helpers';
test.beforeEach(async ({ page }) => mock_map(page));

for (const [kind, query, medium, title] of [
  ['film', 'film=manhattan&place=sutton-square', 'film', 'Sutton Square'],
  [
    'literary',
    'work=gatsby&passage=queensboro-bridge',
    'literature',
    'Queensboro Bridge',
  ],
  [
    'music',
    'track=cornelia-street&place=cornelia-street',
    'music',
    'Cornelia Street',
  ],
])
  test(`${kind} legacy links redirect to the single Atlas and preserve selections`, async ({
    page,
    request,
  }) => {
    const path = `/portfolio/nyc-${kind}-map?${query}&utm_source=friend`;
    const response = await request.get(path, { maxRedirects: 0 });
    expect(response.status()).toBe(308);
    expect(response.headers().location).toContain(atlas_path);
    await page.goto(`${path}#reader`);
    await expect(page.locator('.atlas-card h2')).toHaveText(title);
    await expect(page.locator('.atlas-card')).toHaveAttribute(
      'data-medium',
      medium,
    );
    expect(new URL(page.url()).searchParams.get('utm_source')).toBe('friend');
    expect(new URL(page.url()).hash).toBe('#reader');
    await page.reload();
    await expect(page.locator('.atlas-card h2')).toHaveText(title);
    await expect(page.getByRole('searchbox')).toBeEnabled();
    const selected_url = page.url();
    await page.getByRole('button', { name: 'Close place card' }).click();
    await expect(page.locator('.atlas-card')).toHaveCount(0);
    await page.goBack();
    await expect(page).toHaveURL(selected_url);
    await expect(page.locator('.atlas-card h2')).toHaveText(title);
    await page.goForward();
    await expect(page.locator('.atlas-card')).toHaveCount(0);
  });
