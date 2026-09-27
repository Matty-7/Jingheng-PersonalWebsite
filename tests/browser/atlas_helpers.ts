import { expect, type Page } from '@playwright/test';

export async function mock_map(page: Page) {
  await page.route('https://tile.openstreetmap.org/**', (route) =>
    route.fulfill({
      contentType: 'image/png',
      body: Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGN48e7FfwAJPgO+wPK+MQAAAABJRU5ErkJggg==',
        'base64',
      ),
    }),
  );
}

export async function select_search(page: Page, query: string) {
  const search = page.getByRole('searchbox');
  await expect(search).toBeEnabled();
  await search.fill(query);
  await search.press('Enter');
}

export const atlas_path = '/portfolio/new-york-atlas';
