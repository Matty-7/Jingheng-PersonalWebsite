import { test, expect } from '@playwright/test';
import { atlas_path, mock_map } from './atlas_helpers';

test.beforeEach(async ({ page }) => {
  await mock_map(page);
  await page.goto(atlas_path);
  await expect(page.getByRole('searchbox')).toBeEnabled();
});

test('search explains its scope and pointer selection survives input blur', async ({
  page,
}) => {
  const search = page.getByRole('searchbox');
  await expect(search).toHaveAttribute(
    'placeholder',
    'Search places or titles',
  );
  await search.click();
  await expect(page.locator('#atlas-search-hint')).toContainText(
    'Places, films & TV, music, books, and creators',
  );
  const results = page.locator('#atlas-search-results');
  await expect(results.locator('button')).toHaveCount(0);
  await search.fill('Friends');
  const second = results.locator('[data-atlas-result]').nth(1);
  const selected_id = await second.getAttribute('data-atlas-result');
  await expect(second).toContainText('TV series');
  await expect(second).toContainText('Solow Building');
  // A Safari pointer click may blur the input with no related focus target.
  await search.evaluate((input) => (input as HTMLInputElement).blur());
  await expect(second).toBeVisible();
  await second.click();
  await expect(page.locator('.atlas-card h2')).toHaveText('Solow Building');
  await expect(results).toHaveCount(0);
  await expect(page.locator('.atlas-pin.is-selected')).toBeVisible();
  expect(new URL(page.url()).searchParams.get('entry')).toBe(selected_id);
  await page.reload();
  await expect(page.locator('.atlas-card h2')).toHaveText('Solow Building');
});

test('search navigates results with arrows, Enter and Escape and dismisses outside', async ({
  page,
}) => {
  const search = page.getByRole('searchbox');
  const results = page.locator('#atlas-search-results');
  await search.fill('Friends');
  const options = results.locator('[data-atlas-result]');
  await search.press('ArrowDown');
  await expect(options.nth(0)).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(options.nth(1)).toBeFocused();
  await page.keyboard.press('ArrowUp');
  await expect(options.nth(0)).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(results).toHaveCount(0);
  await expect(search).toBeFocused();
  await search.press('ArrowDown');
  await expect(options.nth(0)).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(page.locator('.atlas-card h2')).toHaveText('Solow Building');
  await page.getByRole('button', { name: 'Close place card' }).click();
  await expect(search).toBeFocused();
  await expect(results).toBeVisible();
  await page.locator('.atlas-brand h1').click();
  await expect(results).toHaveCount(0);
  await search.click();
  await search.press('Shift+Tab');
  await expect(results).toHaveCount(0);
});

test('place, music and author searches expose actionable results and recover from no matches', async ({
  page,
}) => {
  const search = page.getByRole('searchbox');
  for (const [query, medium] of [
    ['cafe lalo', 'film'],
    ['cornelia street', 'music'],
    ['henry james', 'literature'],
  ]) {
    await search.fill(query);
    await page.locator('[data-atlas-result]').first().click();
    await expect(page.locator('.atlas-card')).toHaveAttribute(
      'data-medium',
      medium,
    );
    await expect(page.locator('.atlas-card h2')).toBeFocused();
  }
  await page.getByRole('button', { name: 'Music', exact: true }).click();
  await search.fill('zzzz-no-match');
  await expect(page.locator('#atlas-search-hint')).toContainText('in Music');
  await expect(page.locator('.atlas-search-count')).toContainText('No matches');
  await expect(page.locator('[data-atlas-result]')).toHaveCount(0);
  await page.getByRole('button', { name: 'Clear search' }).click();
  await expect(search).toHaveValue('');
  await expect(search).toBeFocused();
  await expect(page.locator('[data-atlas-result]')).toHaveCount(0);
  await search.fill('cornelia street');
  await search.press('Enter');
  await expect(page.locator('.atlas-card')).toHaveAttribute(
    'data-medium',
    'music',
  );
});
