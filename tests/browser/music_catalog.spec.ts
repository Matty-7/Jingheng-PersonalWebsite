import { test, expect } from '@playwright/test';

test('one Atlas project preserves the music, film and book recommendations', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.locator('#projects h3')).toHaveText([
    'Mortgage Map',
    'New York Atlas',
  ]);
  expect(
    await page
      .locator('main [id]')
      .evaluateAll((elements) =>
        elements
          .map((element) => element.id)
          .filter((id) => ['records', 'films', 'books'].includes(id)),
      ),
  ).toEqual(['records', 'films', 'books']);
});
