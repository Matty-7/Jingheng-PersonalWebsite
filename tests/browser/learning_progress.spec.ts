import { test, expect } from '@playwright/test';
import {
  learning_checks,
  position_cookie,
  progress_key,
} from '../../lib/mortgage_learning';

const page_path = '/portfolio/mortgage-map';

test('server progress restores completion, answer and last lesson after browser cache is cleared', async ({
  page,
  context,
}) => {
  await page.goto(page_path);
  await expect(page.locator('.learning-save-bar')).toContainText(
    'Progress saved for this browser',
  );
  await expect(
    page.getByRole('link', { name: 'Sign in with ChatGPT' }),
  ).toHaveAttribute('href', /signin-with-chatgpt\?return_to=/);
  await page
    .getByRole('button', { name: 'Check understanding', exact: true })
    .click();
  await page
    .getByRole('button', {
      name: learning_checks.incentive.choices[
        learning_checks.incentive.correct
      ],
      exact: true,
    })
    .click();
  await page
    .getByRole('button', { name: 'Mark understood & continue', exact: true })
    .click();
  await expect(page.locator('#learning-title')).toHaveText('Prepayments');
  await expect(page.locator('.learning-save-bar')).toContainText(
    'Progress saved for this browser',
  );
  await page.evaluate(() => localStorage.clear());
  await context.clearCookies({ name: position_cookie });
  await page.goto(page_path);
  await expect(page.locator('#learning-title')).toHaveText('Prepayments');
  await expect(page.locator('.learning-route-header')).toContainText(
    '1 of 5 understood',
  );
  await page.goto(`${page_path}?concept=incentive`);
  const example = page.getByRole('button', {
    name: 'Check understanding',
    exact: true,
  });
  if (await example.isVisible()) await example.click();
  await expect(
    page.getByRole('button', {
      name: learning_checks.incentive.choices[
        learning_checks.incentive.correct
      ],
      exact: true,
    }),
  ).toHaveAttribute('aria-pressed', 'true');
});

test('failed saves survive reload and sync after retry without clearing completed work', async ({
  page,
}) => {
  await page.goto(page_path);
  await expect(page.locator('.learning-save-bar')).toContainText(
    'Progress saved for this browser',
  );
  let fail = true;
  await page.route('**/api/mortgage-progress', (route) =>
    fail && route.request().method() === 'PUT'
      ? route.fulfill({ status: 503, body: '{}' })
      : route.continue(),
  );
  await page
    .getByRole('button', { name: 'Check understanding', exact: true })
    .click();
  await page
    .getByRole('button', {
      name: learning_checks.incentive.choices[
        learning_checks.incentive.correct
      ],
      exact: true,
    })
    .click();
  await page
    .getByRole('button', { name: 'Mark understood & continue', exact: true })
    .click();
  await expect(page.locator('.learning-save-bar')).toContainText(
    'Progress has not synced.',
  );
  await page.reload();
  await expect(page.locator('.learning-route-header')).toContainText(
    '1 of 5 understood',
  );
  await expect(page.locator('.learning-save-bar')).toContainText(
    'Progress has not synced.',
  );
  fail = false;
  await page.getByRole('button', { name: 'Retry save', exact: true }).click();
  await expect(page.locator('.learning-save-bar')).toContainText(
    'Progress saved for this browser',
  );
  const result = await page.request.get('/api/mortgage-progress');
  expect((await result.json()).progress.completed).toContain('incentive');
});

test('legacy browser progress migrates without exposing another visitor’s progress', async ({
  page,
  browser,
}) => {
  await page.addInitScript(
    ({ key }) => {
      if (!localStorage.getItem(key))
        localStorage.setItem(
          key,
          JSON.stringify({
            route_id: 'borrower_decision',
            current_id: 'prepayments',
            completed: ['incentive'],
          }),
        );
    },
    { key: progress_key },
  );
  await page.goto(page_path);
  await expect(page.locator('#learning-title')).toHaveText('Prepayments');
  await expect(page.locator('.learning-save-bar')).toContainText(
    'Progress saved for this browser',
  );
  const result = await page.request.get('/api/mortgage-progress');
  expect((await result.json()).progress.completed).toEqual(['incentive']);
  const unrelated = await browser.newContext();
  try {
    const other = await unrelated.newPage();
    await other.goto(new URL(page_path, page.url()).href);
    await expect(other.locator('.learning-save-bar')).toContainText(
      'Progress saved for this browser',
    );
    await expect(other.locator('.learning-route-header')).toContainText(
      '0 of 5 understood',
    );
  } finally {
    await unrelated.close();
  }
});

test('learning before the first connection keeps retry available and restores on reconnect', async ({
  page,
}) => {
  let offline = true;
  await page.route('**/api/mortgage-progress', (route) =>
    offline ? route.fulfill({ status: 503, body: '{}' }) : route.continue(),
  );
  await page.goto(page_path);
  await expect(
    page.getByRole('button', { name: 'Retry save', exact: true }),
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'Check understanding', exact: true })
    .click();
  await page
    .getByRole('button', {
      name: learning_checks.incentive.choices[
        learning_checks.incentive.correct
      ],
      exact: true,
    })
    .click();
  await page
    .getByRole('button', { name: 'Mark understood & continue', exact: true })
    .click();
  await expect(page.locator('#learning-title')).toHaveText('Prepayments');
  await expect(
    page.getByRole('button', { name: 'Retry save', exact: true }),
  ).toBeVisible();
  offline = false;
  await page.getByRole('button', { name: 'Retry save', exact: true }).click();
  await expect(page.locator('.learning-save-bar')).toContainText(
    'Progress saved for this browser',
  );
  const result = await page.request.get('/api/mortgage-progress');
  expect((await result.json()).progress.completed).toContain('incentive');
});
