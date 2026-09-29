import { test, expect } from '@playwright/test';
import {
  initial_progress,
  learning_checks,
  progress_key,
} from '../../lib/mortgage_learning';

test('course failure keeps the current lesson usable and retries without replacing its surface', async ({
  page,
}) => {
  let fail = true;
  await page.route('**/api/mortgage-lesson?concept=prepayments', (route) =>
    fail ? route.fulfill({ status: 503, body: '{}' }) : route.continue(),
  );
  const catalog_requests: string[] = [];
  page.on('request', (request) => {
    if (new URL(request.url()).pathname === '/api/mortgage-catalog')
      catalog_requests.push(request.url());
  });
  await page.goto('/portfolio/mortgage-map');
  await expect(page.locator('.mortgage-learning')).toHaveAttribute(
    'data-ready',
    'true',
  );
  expect(catalog_requests).toEqual([]);
  const stage = await page.locator('.learning-stage').elementHandle();
  await page.getByRole('button', { name: 'Prepayments', exact: true }).click();
  await expect(page.getByRole('status')).toContainText(
    'This lesson could not load.',
  );
  await expect(page.locator('#learning-title')).toHaveText(
    'When does refinancing make sense?',
  );
  await expect(page.locator('.learning-node.is-current')).toHaveAttribute(
    'data-concept-id',
    'incentive',
  );
  await expect(page).not.toHaveURL(/concept=prepayments/);
  fail = false;
  await page.getByRole('button', { name: 'Try again', exact: true }).click();
  await expect(page.locator('#learning-title')).toHaveText('Prepayments');
  await expect(page.locator('#learning-title')).toBeFocused();
  expect(
    await stage?.evaluate(
      (node) => node === document.querySelector('.learning-stage'),
    ),
  ).toBe(true);
  await page.getByRole('button', { name: 'All topics', exact: true }).click();
  await expect(
    page.getByRole('dialog').locator('.learning-domains > details'),
  ).toHaveCount(10);
  expect(catalog_requests.length).toBe(1);
});

test('search submitted while the catalog loads opens its result when ready', async ({
  page,
}) => {
  let release: () => void = () => {};
  const requested = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route('**/api/mortgage-catalog', async (route) => {
    await requested;
    await route.continue();
  });
  await page.goto('/portfolio/mortgage-map');
  await page
    .getByRole('button', { name: 'Search concepts', exact: true })
    .click();
  const search = page.getByRole('searchbox', {
    name: 'Search mortgage concepts',
  });
  await expect(search).toBeFocused();
  await search.fill('SMM');
  await search.press('Enter');
  await expect(page.getByRole('dialog')).toContainText('Loading topics');
  release();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.locator('#learning-title')).toHaveText('SMM');
  await expect(page.locator('#learning-title')).toBeFocused();
});

test('completing a lesson survives a failed next lesson and reload', async ({
  page,
}) => {
  await page.route('**/api/mortgage-lesson?concept=prepayments', (route) =>
    route.fulfill({ status: 503, body: '{}' }),
  );
  await page.goto('/portfolio/mortgage-map');
  await expect(page.locator('.mortgage-learning')).toHaveAttribute(
    'data-ready',
    'true',
  );
  await page
    .getByRole('button', { name: 'Check understanding', exact: true })
    .click();
  const check = learning_checks.incentive;
  await page
    .getByRole('button', { name: check.choices[check.correct], exact: true })
    .click();
  await page
    .getByRole('button', { name: 'Mark understood & continue', exact: true })
    .click();
  await expect(page.getByRole('status')).toContainText(
    'This lesson could not load.',
  );
  await expect
    .poll(() =>
      page.evaluate(
        (key) => JSON.parse(localStorage.getItem(key)!).completed,
        progress_key,
      ),
    )
    .toContain('incentive');
  await page.reload();
  await expect(page.locator('.mortgage-learning')).toHaveAttribute(
    'data-ready',
    'true',
  );
  await expect(page.locator('.learning-route-header')).toContainText(
    '1 of 5 understood',
  );
  await expect(page.locator('#learning-title')).toHaveText(
    'When does refinancing make sense?',
  );
});

test('failed initial restoration preserves the saved lesson and completed work', async ({
  page,
}) => {
  const saved = {
    ...initial_progress,
    current_id: 'prepayments',
    completed: ['incentive'],
  };
  await page.addInitScript(
    ({ key, saved }) => {
      if (!localStorage.getItem(key))
        localStorage.setItem(key, JSON.stringify(saved));
    },
    { key: progress_key, saved },
  );
  await page.route('**/api/mortgage-lesson?concept=prepayments', (route) =>
    route.fulfill({ status: 503, body: '{}' }),
  );
  await page.goto('/portfolio/mortgage-map');
  await expect(page.getByRole('status')).toContainText(
    'This lesson could not load.',
  );
  expect(
    await page.evaluate(
      (key) => JSON.parse(localStorage.getItem(key)!),
      progress_key,
    ),
  ).toEqual(saved);
  await page.reload();
  await expect(page.getByRole('status')).toContainText(
    'This lesson could not load.',
  );
  expect(
    await page.evaluate(
      (key) => JSON.parse(localStorage.getItem(key)!),
      progress_key,
    ),
  ).toEqual(saved);
  await page.locator('.learning-node.is-current').click();
  await expect
    .poll(() =>
      page.evaluate(
        (key) => JSON.parse(localStorage.getItem(key)!),
        progress_key,
      ),
    )
    .toEqual({ ...saved, current_id: 'incentive' });
});
