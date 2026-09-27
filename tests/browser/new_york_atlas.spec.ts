import { test, expect } from '@playwright/test';
import {
  mock_map,
  select_search,
  atlas_path,
  map_style_url,
} from './atlas_helpers';

test.beforeEach(async ({ page }) => mock_map(page));

test('map-first Atlas filters and searches without page scrolling or collection navigation', async ({
  page,
}) => {
  await page.goto(atlas_path);
  await expect(page.locator('.atlas-map.leaflet-container')).toBeVisible();
  await expect(page.locator('.atlas-card')).toHaveCount(0);
  await expect(page.locator('.maplibregl-canvas')).toBeVisible();
  await expect(page.locator('.atlas-map-status')).toHaveCount(0);
  await expect(page.locator('.leaflet-control-attribution')).toContainText(
    'OpenFreeMap',
  );
  await expect(page.locator('.leaflet-control-attribution')).toContainText(
    'OpenStreetMap',
  );
  await expect(page.locator('.atlas-cluster').first()).toBeVisible();
  await select_search(page, 'cafe lalo');
  await expect(page.locator('.atlas-card h2')).toHaveText('Café Lalo');
  await expect(page.locator('.atlas-pin.is-selected')).toBeVisible();
  await expect(page.locator('.atlas-card')).toHaveAttribute(
    'data-medium',
    'film',
  );
  await expect(page.getByRole('link', { name: /collection/ })).toHaveCount(0);
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollHeight <= innerHeight + 1 &&
        document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.getByRole('button', { name: 'Close place card' }).click();
  await expect(page.locator('.atlas-card')).toHaveCount(0);
  await page.getByRole('button', { name: /^Café Lalo:/ }).press('Enter');
  await expect(page.locator('.atlas-card h2')).toHaveText('Café Lalo');
  await page.getByRole('button', { name: 'Music', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'No connections found.' }),
  ).toBeVisible();
  await expect(page.locator('.atlas-card')).toHaveCount(0);
  await expect(page.locator('.atlas-pin, .atlas-cluster')).toHaveCount(0);
  await page.getByRole('button', { name: 'Reset filters' }).click();
  await expect(page.getByRole('searchbox')).toHaveValue('');
  await expect(page.locator('.atlas-cluster').first()).toBeVisible();
});

test('film, music and literature share one compact card and keyboard-accessible source dialog', async ({
  page,
}) => {
  await page.goto(atlas_path);
  const sizes: number[] = [];
  for (const [query, medium] of [
    ['cafe lalo', 'film'],
    ['henry james', 'literature'],
    ['cornelia street', 'music'],
  ]) {
    await select_search(page, query);
    const card = page.locator('.atlas-card');
    await expect(card).toHaveAttribute('data-medium', medium);
    await expect(card).toHaveAttribute('aria-busy', 'false');
    await expect(card.locator('.atlas-artwork')).toBeVisible();
    await expect(card.locator('.atlas-card-copy')).toBeVisible();
    await expect(card.locator('.atlas-card-actions')).toBeVisible();
    sizes.push((await card.boundingBox())!.width);
    await page
      .getByRole('button', { name: 'Sources and place details' })
      .press('Enter');
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(
      page.getByRole('dialog').getByRole('link').first(),
    ).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).not.toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Sources and place details' }),
    ).toBeFocused();
  }
  expect(new Set(sizes).size).toBe(1);
  await expect(page.locator('audio')).toHaveCount(1);
  await expect(page.locator('audio')).not.toHaveAttribute('src');
});

test('sources retain TV metadata and geographic precision when images fail', async ({
  page,
}) => {
  await page.route('**/images/**', (route) => route.abort());
  await page.goto(atlas_path);
  await select_search(page, 'Marta Kauffman');
  await expect(page.locator('.atlas-eyebrow')).toContainText(
    'TV series · 1994–2004',
  );
  await expect(page.locator('.atlas-artwork')).toHaveCount(0);
  await expect(page.getByText('Image unavailable')).toHaveCount(0);
  await page.getByRole('button', { name: 'Sources and place details' }).click();
  await expect(page.getByRole('dialog')).toContainText(
    'Created by David Crane and Marta Kauffman',
  );
  await expect(page.getByRole('dialog').locator('.atlas-still')).toHaveCount(0);
  await expect(
    page.getByRole('dialog').getByRole('link', { name: 'Frame source' }),
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'Close details', exact: true })
    .click();
  await select_search(page, 'henry james');
  await expect(page.locator('.atlas-scope')).toContainText(
    'not an identified address',
  );
  await page.getByRole('button', { name: 'Sources and place details' }).click();
  await expect(page.getByRole('dialog').locator('blockquote')).toContainText(
    'white marble steps',
  );
});

test('source dialogs keep one image source and distinct supporting references', async ({
  page,
}) => {
  await page.goto(`${atlas_path}?entry=film:new-york-palace:gossip-girl`);
  await page.getByRole('button', { name: 'Sources and place details' }).click();
  const dialog = page.getByRole('dialog');
  await expect(
    dialog.getByRole('link', { name: 'Frame source' }),
  ).toBeVisible();
  await expect(dialog.locator('.atlas-story a')).toHaveCount(1);
  await expect(dialog.getByText('Scene sources', { exact: true })).toHaveCount(
    0,
  );
  await page.keyboard.press('Escape');
  await select_search(page, 'cafe lalo');
  await page.getByRole('button', { name: 'Sources and place details' }).click();
  await dialog.getByText('Scene sources', { exact: true }).click();
  await expect(
    dialog.getByRole('link', { name: 'Closure report · West Side Rag' }),
  ).toBeVisible();
  const hrefs = await dialog
    .locator('.atlas-story a')
    .evaluateAll((links) => links.map((link) => link.getAttribute('href')));
  expect(new Set(hrefs).size).toBe(hrefs.length);
});

test('clusters support keyboard expansion and map failure keeps search usable', async ({
  page,
}) => {
  await page.goto(atlas_path);
  const cluster = page.locator('.atlas-cluster').first();
  await expect(cluster).toHaveAttribute('role', 'button');
  const initial = await cluster.getAttribute('aria-label');
  const cluster_icon = await cluster.elementHandle();
  const position_before = await cluster.getAttribute('style');
  await cluster.press('Space');
  await expect
    .poll(() =>
      cluster_icon!.evaluate(
        (element, position) =>
          !element.isConnected || element.getAttribute('style') !== position,
        position_before,
      ),
    )
    .toBe(true);
  await expect(page.locator('.atlas-map')).toBeFocused();
  expect(initial).toMatch(/places. Zoom to explore/);
  await page.unroute(map_style_url);
  await page.route(map_style_url, (route) => route.abort());
  await page.reload();
  await expect(
    page.getByText('Map unavailable. Search still works.'),
  ).toBeVisible({ timeout: 20000 });
  await select_search(page, 'cafe lalo');
  await expect(
    page.getByRole('link', { name: 'Open in Google Maps' }),
  ).toBeVisible();
  await expect(page.getByRole('button', { name: 'Retry map' })).toBeVisible();
  await page.unroute(map_style_url);
  await mock_map(page);
  await page.getByRole('button', { name: 'Retry map' }).click();
  await expect(page.locator('.atlas-map-status')).toHaveCount(0);
  await expect(page.locator('.maplibregl-canvas')).toHaveCount(1);
  await expect(page.locator('.atlas-pin.is-selected')).toBeVisible();
});

test('missing artwork leaves a compact text card and the next selection restores its image', async ({
  page,
}) => {
  await page.route('**/api/atlas-entry?*', async (route) => {
    const response = await route.fetch();
    const detail = await response.json();
    if (detail.entry.id === 'film:tatiana:anora')
      delete detail.entry.scene.still;
    await route.fulfill({ response, json: detail });
  });
  await page.goto(atlas_path);
  for (const query of ['Tatiana Grill']) {
    await select_search(page, query);
    await expect(page.locator('.atlas-card')).toHaveAttribute(
      'aria-busy',
      'false',
    );
    await expect(page.locator('.atlas-artwork')).toHaveCount(0);
    await expect(page.getByText('Image unavailable')).toHaveCount(0);
    const card = page.locator('.atlas-card');
    const copy = card.locator('.atlas-card-copy');
    await expect(copy).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Open in Google Maps' }),
    ).toBeVisible();
    const card_box = (await card.boundingBox())!;
    const copy_box = (await copy.boundingBox())!;
    expect(copy_box.x - card_box.x).toBeLessThan(30);
    expect(copy_box.width).toBeGreaterThan(card_box.width / 2);
  }
  await select_search(page, 'cafe lalo');
  await expect(page.locator('.atlas-artwork img')).toBeVisible();
  await expect
    .poll(() =>
      page
        .locator('.atlas-artwork img')
        .evaluate(
          (img: HTMLImageElement) => img.complete && img.naturalWidth > 0,
        ),
    )
    .toBe(true);
});

test('failed literature and music covers collapse their whole artwork area', async ({
  page,
}) => {
  await page.route('**/images/**', (route) => route.abort());
  await page.route('https://*.mzstatic.com/**', (route) => route.abort());
  await page.goto(atlas_path);
  for (const query of ['henry james', 'cornelia street']) {
    await select_search(page, query);
    await expect(page.locator('.atlas-card')).toHaveAttribute(
      'aria-busy',
      'false',
    );
    await expect(page.locator('.atlas-artwork')).toHaveCount(0);
    await expect(page.locator('.atlas-card-copy')).toBeVisible();
    await expect(page.getByText('Image unavailable')).toHaveCount(0);
  }
  await page.unroute('**/images/**');
  await select_search(page, 'cafe lalo');
  await expect(page.locator('.atlas-artwork img')).toBeVisible();
});

test('Anora retains its verified Tatiana frame', async ({ page }) => {
  await page.goto(atlas_path);
  for (const query of ['Tatiana Grill']) {
    await select_search(page, query);
    await expect(page.locator('.atlas-artwork img')).toBeVisible();
    await expect
      .poll(() =>
        page
          .locator('.atlas-artwork img')
          .evaluate(
            (img: HTMLImageElement) => img.complete && img.naturalWidth > 0,
          ),
      )
      .toBe(true);
  }
  await page.getByRole('button', { name: 'Sources and place details' }).click();
  await expect(
    page.getByRole('dialog').getByRole('link', { name: 'Frame source' }),
  ).toBeVisible();
});

test('unsupported WebGL keeps search and retry usable without the removed cafe', async ({
  page,
}) => {
  // Match the focus suite: third-party telemetry is outside this map failure test.
  await page.route(
    'https://static.cloudflareinsights.com/beacon.min.js',
    (route) =>
      route.fulfill({ contentType: 'application/javascript', body: '' }),
  );
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.addInitScript(() => {
    // The native method is called with its original canvas as this below.
    // oxlint-disable-next-line typescript/unbound-method
    const get_context = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      ...args: Parameters<typeof get_context>
    ) {
      if (String(args[0]).startsWith('webgl')) return null;
      return get_context.apply(this, args);
    } as typeof get_context;
  });
  await page.goto(atlas_path);
  await expect(page.getByRole('button', { name: 'Retry map' })).toBeVisible();
  await select_search(page, 'cafe lalo');
  await expect(page.locator('.atlas-card h2')).toHaveText('Café Lalo');
  await page.getByRole('button', { name: 'Retry map' }).click();
  await expect(page.getByRole('button', { name: 'Retry map' })).toBeVisible();
  await expect(page.locator('.atlas-pin.is-selected')).toBeVisible();
  await expect(page.locator('.maplibregl-canvas')).toHaveCount(0);
  await page.getByRole('searchbox').fill('Ocean View Cafe');
  await expect(
    page.getByRole('heading', { name: 'No connections found.' }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
