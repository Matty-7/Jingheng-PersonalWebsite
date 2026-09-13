import { test, expect } from '@playwright/test';

test.use({ reducedMotion: 'no-preference' });

test('overview offers readable domains without zooming', async ({
  page,
}, test_info) => {
  await page.goto('/portfolio/mortgage-map');
  const graph_titles = page.locator('.node-branch strong');
  const domain_entries = page.locator('.atlas-browse-domain');
  await expect(graph_titles).toHaveCount(10);
  await expect
    .poll(async () => {
      if ((await domain_entries.count()) === 10) {
        return domain_entries.evaluateAll((entries) =>
          entries.every((entry) => {
            const title = entry.querySelector('strong')!;
            const question = entry.querySelector('small')!;
            return (
              parseFloat(getComputedStyle(title).fontSize) >= 16 &&
              parseFloat(getComputedStyle(question).fontSize) >= 13 &&
              title.textContent!.length > 0 &&
              question.textContent!.length > 0
            );
          }),
        );
      }
      return graph_titles.evaluateAll((titles) =>
        titles.every((title) => {
          const world = title.closest('.atlas-world')!;
          const scale = new DOMMatrix(getComputedStyle(world).transform).a;
          const text = title.getBoundingClientRect();
          const card = title.closest('button')!.getBoundingClientRect();
          return (
            parseFloat(getComputedStyle(title).fontSize) * scale >= 15.9 &&
            text.left >= card.left &&
            text.right <= card.right + 1 &&
            text.top >= card.top &&
            text.bottom <= card.bottom + 1 &&
            title.scrollWidth <= title.clientWidth + 1
          );
        }),
      );
    })
    .toBe(true);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth - innerWidth,
    ),
  ).toBe(0);
  await test_info.attach('readable-overview', {
    body: await page.screenshot({ fullPage: true }),
    contentType: 'image/png',
  });

  if (await domain_entries.count()) {
    await page
      .getByRole('navigation', { name: 'Browse map at readable size' })
      .getByRole('button', { name: /Cash flows & value/ })
      .click();
  } else {
    await page
      .getByRole('button', { name: 'Explore Cash flows & value', exact: true })
      .click();
  }
  await expect(page.locator('.atlas-browse-question')).toHaveText(
    'How does future money become today’s value?',
  );
  await expect(page.locator('.atlas-browse-question')).toHaveCSS(
    'font-size',
    '13px',
  );
});

test('first visit can start a reading path with the keyboard', async ({
  page,
}) => {
  await page.goto('/portfolio/mortgage-map');
  const start = page.getByRole('button', {
    name: 'Start with a reading path',
    exact: true,
  });
  await expect(start).toBeInViewport();
  await start.press('Enter');
  const paths = page.getByRole('region', { name: 'Reading paths' });
  await expect(
    paths.getByRole('heading', { name: 'Follow a mechanism.' }),
  ).toBeFocused();
  const first_path = paths.locator('.atlas-model-cards button').first();
  const title = await first_path.locator('strong').innerText();
  await first_path.click();
  await expect(
    paths.getByRole('heading', { name: title, exact: true }),
  ).toBeFocused();
  const first_step = paths.locator('.atlas-model-steps button').first();
  const concept = (await first_step.innerText()).trim();
  await first_step.click();
  const reader = page.getByRole('complementary', { name: 'Concept reader' });
  await expect(reader.getByRole('heading', { level: 2 })).toHaveText(concept);
  await page.getByRole('button', { name: 'Close concept reader' }).click();
  await expect(first_step).toBeFocused();
});
