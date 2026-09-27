import { test, expect } from '@playwright/test';
import { mock_map, select_search, atlas_path } from './atlas_helpers';
const detail_pattern = '**/api/atlas-entry?*';
test.beforeEach(async ({ page }) => mock_map(page));

test('same-place works are visible buttons with a full-width mobile rail', async ({
  page,
}, test_info) => {
  await page.goto(`${atlas_path}?entry=film%3Alibrary%3Aghostbusters`);
  await expect(page.getByRole('searchbox')).toBeEnabled();
  const card = page.locator('.atlas-card');
  const works = card.getByRole('navigation', { name: 'Works at this place' });
  await expect(works.getByRole('button')).toHaveCount(3);
  await expect(
    works.getByRole('button', { name: 'Ghostbusters', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
  await expect(card.getByRole('combobox')).toHaveCount(0);
  if (page.viewportSize()!.width <= 760) {
    const card_box = (await card.boundingBox())!;
    const rail_box = (await works.boundingBox())!;
    expect(rail_box.width).toBeGreaterThan(card_box.width - 32);
  }
  await page.screenshot({
    path: test_info.outputPath('atlas_work_switcher.png'),
  });
  const seinfeld = works.getByRole('button', { name: 'Seinfeld', exact: true });
  await seinfeld.click();
  await expect(seinfeld).toHaveAttribute('aria-pressed', 'true');
  await expect(card).toHaveAttribute('aria-busy', 'false');
  await expect(card.locator('.atlas-card-description')).toContainText(
    'overdue book',
  );
  await page.goBack();
  await expect(
    works.getByRole('button', { name: 'Ghostbusters', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
  expect(await works.evaluate((element) => element.scrollLeft)).toBeLessThan(8);
});

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
  const works = page.getByRole('navigation', { name: 'Works at this place' });
  await expect(
    works.getByRole('button', { name: "You've Got Mail", exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
  expect(requests).toHaveLength(0);
  const loaded = page.waitForResponse((response) =>
    response.url().includes('/api/atlas-entry?'),
  );
  const manhattan = works.getByRole('button', {
    name: 'Manhattan',
    exact: true,
  });
  await manhattan.focus();
  await manhattan.press('Enter');
  await expect(manhattan).toBeFocused();
  await expect(manhattan).toHaveAttribute('aria-pressed', 'true');
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
    works.getByRole('button', { name: "You've Got Mail", exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
  await page.goForward();
  await expect(manhattan).toHaveAttribute('aria-pressed', 'true');
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
    'James moves from the crowded streets into a quiet square',
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

test('search intent shares the pending detail and loads only card artwork until details open', async ({
  page,
}) => {
  let release: () => void = () => {};
  const held = new Promise<void>((resolve) => {
    release = resolve;
  });
  let attempts = 0;
  let still = { src: '', thumbnail: '' };
  const images: string[] = [];
  page.on('request', (request) => {
    if (request.resourceType() === 'image')
      images.push(new URL(request.url()).pathname);
  });
  await page.route(detail_pattern, async (route) => {
    ++attempts;
    const response = await route.fetch();
    still = (await response.json()).entry.scene.still;
    await held;
    await route.fulfill({ response });
  });
  await page.goto(atlas_path);
  await page.getByRole('searchbox').fill('cafe lalo');
  const result = page.locator('#atlas-search-results button').first();
  await result.focus();
  await expect.poll(() => attempts).toBe(1);
  await result.press('Enter');
  await expect(page.locator('.atlas-card')).toHaveAttribute(
    'aria-busy',
    'true',
  );
  expect(attempts).toBe(1);
  release();
  await expect(page.locator('.atlas-card')).toHaveAttribute(
    'aria-busy',
    'false',
  );
  await expect(page.locator('.atlas-artwork img')).toHaveJSProperty(
    'src',
    new URL(still.thumbnail, page.url()).href,
  );
  await expect(page.locator('.atlas-artwork img')).toHaveAttribute(
    'loading',
    'eager',
  );
  await expect.poll(() => images.includes(still.thumbnail)).toBe(true);
  expect(images).not.toContain(still.src);
  await expect(page.locator('.atlas-info-dialog .atlas-story')).toHaveCount(0);
  await page.getByRole('button', { name: 'Sources and place details' }).click();
  await expect(
    page.locator('.atlas-info-dialog .atlas-still img'),
  ).toHaveJSProperty('src', new URL(still.src, page.url()).href);
  await expect.poll(() => images.includes(still.src)).toBe(true);
  expect(attempts).toBe(1);
});

test('a failed intent prefetch does not prevent a later selection from loading', async ({
  page,
}) => {
  let attempts = 0;
  await page.route(detail_pattern, (route) => {
    ++attempts;
    if (attempts === 1)
      return route.fulfill({ status: 503, body: 'Unavailable' });
    return route.continue();
  });
  await page.goto(atlas_path);
  await page.getByRole('searchbox').fill('henry james');
  const result = page.locator('#atlas-search-results button').first();
  const failure = page.waitForResponse(
    (response) =>
      response.url().includes('/api/atlas-entry?') && response.status() === 503,
  );
  await result.focus();
  await failure;
  await page.getByRole('searchbox').focus();
  await page.getByRole('searchbox').press('Enter');
  await expect(page.locator('.atlas-card')).toHaveAttribute(
    'aria-busy',
    'false',
  );
  await expect(page.locator('.atlas-card-description')).toContainText(
    'James moves from the crowded streets into a quiet square',
  );
  expect(attempts).toBe(2);
});
