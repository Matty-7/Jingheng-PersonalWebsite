import { test, expect } from '@playwright/test';
import { mock_map, select_search, atlas_path } from './atlas_helpers';
const detail_pattern = '**/api/atlas-entry?*';
test.beforeEach(async ({ page }) => mock_map(page));

test('linked detail is rendered without a request and same-place history is cached', async ({
  page,
  request,
}) => {
  const requests: string[] = [];
  page.on('request', (request) => {
    if (request.url().includes('/api/atlas-entry?'))
      requests.push(request.url());
  });
  await page.goto(
    `${atlas_path}?entry=film%3Azabars%3Ayouve-got-mail&utm_source=test`,
  );
  await expect(page.getByRole('searchbox')).toBeEnabled();
  await expect(
    page.getByRole('combobox', { name: 'Works at this place' }),
  ).toHaveValue('film:zabars:youve-got-mail');
  expect(requests).toHaveLength(0);
  const loaded = page.waitForResponse((response) =>
    response.url().includes('/api/atlas-entry?'),
  );
  await page
    .getByRole('combobox', { name: 'Works at this place' })
    .selectOption('film:zabars:manhattan');
  const response = await loaded;
  expect(response.status()).toBe(200);
  expect(response.headers()['cache-control']).toBe('no-store');
  expect((await response.json()).entry.id).toBe('film:zabars:manhattan');
  await expect(page.locator('.atlas-card')).toHaveAttribute(
    'aria-busy',
    'false',
  );
  await expect(page.locator('.atlas-eyebrow').first()).toContainText('1979');
  await page.goBack();
  await expect(
    page.getByRole('combobox', { name: 'Works at this place' }),
  ).toHaveValue('film:zabars:youve-got-mail');
  await page.goForward();
  await expect(
    page.getByRole('combobox', { name: 'Works at this place' }),
  ).toHaveValue('film:zabars:manhattan');
  expect(requests).toHaveLength(1);
  expect(new URL(page.url()).searchParams.get('utm_source')).toBe('test');
  expect((await request.get('/api/atlas-entry?entry=missing')).status()).toBe(
    404,
  );
});

test('a delayed detail never replaces a later selection or empty search', async ({
  page,
}) => {
  let release: () => void = () => {};
  const held = new Promise<void>((resolve) => {
    release = resolve;
  });
  let complete: () => void = () => {};
  const completed = new Promise<void>((resolve) => {
    complete = resolve;
  });
  await page.route(detail_pattern, async (route) => {
    if (
      new URL(route.request().url()).searchParams.get('entry') !==
      'literature:washington-square'
    )
      return route.continue();
    const response = await route.fetch();
    await held;
    await route.fulfill({ response }).catch(() => {});
    complete();
  });
  await page.goto(atlas_path);
  const started = page.waitForRequest((request) =>
    request.url().includes('entry=literature%3Awashington-square'),
  );
  await select_search(page, 'henry james');
  await started;
  await expect(page.locator('.atlas-loading')).toContainText('Loading details');
  await select_search(page, 'cafe lalo');
  await expect(page.locator('.atlas-card')).toHaveAttribute(
    'aria-busy',
    'false',
  );
  release();
  await completed;
  await expect(page.locator('.atlas-card h2')).toHaveText('Café Lalo');
  await page.getByRole('searchbox').fill('zzzz-no-match');
  await expect(page.locator('.atlas-card')).toHaveCount(0);
  await expect(page.locator('audio')).not.toHaveAttribute('src');
});

test('failed or mismatched details retry and preserve a full-page fallback', async ({
  page,
}) => {
  let attempts = 0;
  await page.route(detail_pattern, async (route) => {
    ++attempts;
    if (attempts === 1 || attempts > 3)
      return route.fulfill({ status: 503, body: 'Unavailable' });
    if (attempts === 2)
      return route.fulfill({ json: { entry: { id: 'wrong' } } });
    return route.continue();
  });
  await page.goto(`${atlas_path}?utm_source=test#reader`);
  await select_search(page, 'henry james');
  const retry = page.getByRole('button', { name: 'Retry loading details' });
  await expect(retry).toBeVisible();
  const original_url = page.url();
  await expect(
    page.getByRole('link', { name: 'Open this selection as a page' }),
  ).toHaveAttribute('href', original_url);
  await retry.click();
  await expect.poll(() => attempts).toBe(2);
  await expect(retry).toBeVisible();
  await retry.click();
  await expect(page.locator('.atlas-card')).toHaveAttribute(
    'aria-busy',
    'false',
  );
  await expect(page.locator('.atlas-card-description')).toContainText(
    'white marble steps',
  );
  await select_search(page, 'cafe lalo');
  await page
    .getByRole('link', { name: 'Open this selection as a page' })
    .click();
  await expect(page.locator('.atlas-card h2')).toHaveText('Café Lalo');
  await expect(page.locator('.atlas-card')).toHaveAttribute(
    'aria-busy',
    'false',
  );
  expect(new URL(page.url()).searchParams.get('utm_source')).toBe('test');
  expect(new URL(page.url()).hash).toBe('#reader');
});
