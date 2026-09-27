import { expect, type Page } from '@playwright/test';

export const map_style_url = 'https://tiles.openfreemap.org/styles/positron';

export async function mock_map(page: Page) {
  await page.route(map_style_url, (route) =>
    route.fulfill({
      json: {
        version: 8,
        sources: {
          streets: {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: [
                  [-74.01, 40.7],
                  [-73.93, 40.85],
                ],
              },
            },
          },
        },
        layers: [
          {
            id: 'land',
            type: 'background',
            paint: { 'background-color': '#f2f3f0' },
          },
          {
            id: 'streets',
            type: 'line',
            source: 'streets',
            paint: { 'line-color': '#ffffff', 'line-width': 3 },
          },
        ],
      },
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
