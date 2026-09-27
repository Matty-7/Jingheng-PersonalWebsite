import { test, expect } from '@playwright/test';
import { learning_checks } from '../../lib/mortgage_learning';

test('free jumps become the saved lesson and support native browser history', async ({
  page,
}) => {
  await page.goto('/portfolio/mortgage-map');
  await expect(page.locator('.mortgage-learning')).toHaveAttribute(
    'data-ready',
    'true',
  );
  await expect(page).toHaveURL(/\/portfolio\/mortgage-map$/);
  const lesson_requests: string[] = [];
  page.on('request', (request) => {
    if (
      request.resourceType() === 'fetch' &&
      new URL(request.url()).pathname === '/portfolio/mortgage-map'
    )
      lesson_requests.push(request.url());
  });
  await page.getByRole('button', { name: 'Prepayments', exact: true }).click();
  await expect(page.getByRole('heading', { level: 2 })).toHaveText(
    'Prepayments',
  );
  await page.goBack();
  await expect(page.getByRole('heading', { level: 2 })).toHaveText(
    'When does refinancing make sense?',
  );
  await page.goForward();
  await expect(page.getByRole('heading', { level: 2 })).toHaveText(
    'Prepayments',
  );
  await expect(
    page.getByRole('button', {
      name: /Learn from here|Back to your learning path|View full tree/,
    }),
  ).toHaveCount(0);
  await page.goto('/portfolio/mortgage-map');
  await expect(page.getByRole('heading', { level: 2 })).toHaveText(
    'Prepayments',
  );
  await expect(page).toHaveURL(/\/portfolio\/mortgage-map$/);
  expect(lesson_requests).toEqual([]);
});

test('lesson changes retain the learning surface and reset the answer', async ({
  page,
}) => {
  await page.goto('/portfolio/mortgage-map?concept=loan_states');
  await expect(page.locator('.mortgage-learning')).toHaveAttribute(
    'data-ready',
    'true',
  );
  const stage = await page.locator('.learning-stage').elementHandle();
  const title = await page.locator('#learning-title').elementHandle();
  const check = learning_checks.loan_states;
  await page
    .getByRole('button', { name: check.choices[check.correct], exact: true })
    .click();
  await expect(
    page.getByRole('button', {
      name: 'Mark understood & continue',
      exact: true,
    }),
  ).toBeEnabled();
  await page
    .getByRole('navigation', { name: 'Local learning tree' })
    .getByRole('button', { name: 'Monthly payment rate', exact: true })
    .click();
  expect(
    await stage?.evaluate(
      (node) => node === document.querySelector('.learning-stage'),
    ),
  ).toBe(true);
  expect(
    await title?.evaluate(
      (node) => node === document.querySelector('#learning-title'),
    ),
  ).toBe(true);
  await expect(
    page.getByRole('button', {
      name: 'Mark understood & continue',
      exact: true,
    }),
  ).toBeDisabled();
  await expect(page.locator('.learning-answer')).toHaveCount(0);
  await expect(page.locator('#learning-title')).toBeFocused();
});

test('refresh and a return visit render the chosen lesson before JavaScript runs', async ({
  page,
  browser,
}) => {
  await page.goto('/portfolio/mortgage-map?concept=loan_states');
  await expect(page.locator('.mortgage-learning')).toHaveAttribute(
    'data-ready',
    'true',
  );
  await expect
    .poll(async () =>
      (await page.context().cookies()).some(
        (cookie) => cookie.name === 'mortgage-map-position-v1',
      ),
    )
    .toBe(true);
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    await context.addCookies(await page.context().cookies());
    const static_page = await context.newPage();
    await static_page.goto(page.url());
    await expect(static_page.locator('#learning-title')).toHaveText(
      'Loan state transitions',
    );
    await expect(static_page.locator('.mortgage-learning')).toHaveAttribute(
      'data-ready',
      'false',
    );
    await static_page.goto(new URL('/portfolio/mortgage-map', page.url()).href);
    await expect(static_page.locator('#learning-title')).toHaveText(
      'Loan state transitions',
    );
  } finally {
    await context.close();
  }
});
