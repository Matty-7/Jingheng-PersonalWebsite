import { test, expect } from '@playwright/test';

const atlas_path = '/portfolio/new-york-atlas';
const detail_pattern = '**/api/atlas-entry?*';

test.beforeEach(async ({ page }) => {
  await page.route('https://www.google.com/maps/embed/**', (route) =>
    route.fulfill({
      contentType: 'text/html',
      body: '<!doctype html><title>Map fixture</title>',
    }),
  );
});

test('Atlas renders the linked detail without a request and reuses history selections', async ({
  page,
  request,
}) => {
  const requests: string[] = [];
  page.on('request', (request) => {
    if (request.url().includes('/api/atlas-entry?'))
      requests.push(request.url());
  });
  await page.goto(
    `${atlas_path}?medium=literature&entry=literature%3Awashington-square&utm_source=test`,
  );
  await expect(page.getByRole('searchbox')).toBeEnabled();
  await expect(page.locator('.atlas-story blockquote')).toContainText(
    'white marble steps',
  );
  expect(requests).toHaveLength(0);
  const loaded = page.waitForResponse((response) =>
    response.url().includes('/api/atlas-entry?'),
  );
  await page
    .getByRole('region', { name: 'Related works' })
    .getByRole('button')
    .filter({ hasText: 'Washington Square Arch' })
    .first()
    .press('Enter');
  const response = await loaded;
  expect(response.status()).toBe(200);
  expect(response.headers()['cache-control']).toBe('no-store');
  const detail = await response.json();
  expect(detail.entry.id).toMatch(/^film:washington-square-arch:/);
  expect(detail.sources.map((source: { id: string }) => source.id)).toEqual(
    detail.entry.scene.source_ids,
  );
  expect(detail).not.toHaveProperty('atlas_entries');
  await expect(page.locator('.atlas-detail')).toHaveAttribute(
    'data-medium',
    'film',
  );
  await page.goBack();
  await expect(page.locator('.atlas-detail')).toHaveAttribute(
    'data-medium',
    'literature',
  );
  await page.goForward();
  await expect(page.locator('.atlas-detail')).toHaveAttribute(
    'data-medium',
    'film',
  );
  expect(requests).toHaveLength(1);
  expect(new URL(page.url()).searchParams.get('utm_source')).toBe('test');
  expect((await request.get('/api/atlas-entry?entry=missing')).status()).toBe(
    404,
  );
  expect((await request.get('/api/atlas-entry')).status()).toBe(404);
});

test('fast searches never display an outdated detail and empty results stay empty', async ({
  page,
}) => {
  let release: () => void = () => {};
  let finished: () => void = () => {};
  const held = new Promise<void>((resolve) => {
    release = resolve;
  });
  const completed = new Promise<void>((resolve) => {
    finished = resolve;
  });
  await page.route(detail_pattern, async (route) => {
    const id = new URL(route.request().url()).searchParams.get('entry');
    if (id !== 'literature:washington-square') return route.continue();
    const response = await route.fetch();
    await held;
    try {
      await route.fulfill({ response });
    } finally {
      finished();
    }
  });
  await page.goto(atlas_path);
  const search = page.getByRole('searchbox');
  await expect(search).toBeEnabled();
  const started = page.waitForRequest((request) =>
    request
      .url()
      .includes('/api/atlas-entry?entry=literature%3Awashington-square'),
  );
  await search.fill('henry james');
  await started;
  await expect(page.locator('.atlas-loading')).toContainText('Loading details');
  await expect(page.locator('.atlas-place-heading h2')).toHaveText(
    'Washington Square',
  );
  await search.fill('cafe lalo');
  await expect(page.locator('.atlas-detail')).toHaveAttribute(
    'data-medium',
    'film',
  );
  release();
  await completed;
  await expect(page.locator('.atlas-place-heading h2')).toHaveText('Café Lalo');
  await expect(page.locator('.atlas-work-heading h3')).toHaveText(
    "You've Got Mail",
  );
  await search.fill('zzzz-no-match');
  await expect(
    page.getByRole('heading', { name: 'No connections found.' }),
  ).toBeVisible();
  await expect(
    page.locator('.atlas-detail, .atlas-loading, .atlas-map'),
  ).toHaveCount(0);
  await expect(page.locator('audio')).not.toHaveAttribute('src');
});

test('failed and mismatched detail requests can be retried without losing the selection', async ({
  page,
}) => {
  let attempts = 0;
  await page.route(detail_pattern, async (route) => {
    ++attempts;
    if (attempts === 1)
      return route.fulfill({ status: 503, body: 'Temporarily unavailable' });
    if (attempts === 2)
      return route.fulfill({ json: { entry: { id: 'wrong-entry' } } });
    return route.continue();
  });
  await page.goto(atlas_path);
  const search = page.getByRole('searchbox');
  await expect(search).toBeEnabled();
  await search.fill('henry james');
  const retry = page.getByRole('button', { name: 'Retry loading details' });
  await expect(retry).toBeVisible();
  const selected_url = page.url();
  await expect(
    page.getByRole('link', { name: 'Open this selection as a page' }),
  ).toHaveAttribute('href', /entry=literature%3Awashington-square/);
  await expect(page.locator('.atlas-detail')).toHaveCount(0);
  await retry.press('Enter');
  await expect.poll(() => attempts).toBe(2);
  await expect(retry).toBeVisible();
  await retry.press('Enter');
  await expect(page.locator('.atlas-story blockquote')).toContainText(
    'white marble steps',
  );
  await expect(page).toHaveURL(selected_url);
  await expect(search).toHaveValue('henry james');
  expect(attempts).toBe(3);
  await expect(page.locator('audio')).toHaveCount(1);
});
