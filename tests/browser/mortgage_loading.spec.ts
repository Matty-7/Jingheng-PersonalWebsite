import { test, expect } from '@playwright/test';

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
