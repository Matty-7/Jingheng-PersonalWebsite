import { test, expect } from '@playwright/test';

test.use({ reducedMotion: 'reduce' });

test('compact navigation keeps settings, sibling reading and focus accessible', async ({
  page,
}, test_info) => {
  await page.goto('/portfolio/mortgage-map');
  const settings = page.getByRole('button', {
    name: 'Map settings',
    exact: true,
  });
  const domain = page.getByRole('combobox', { name: 'Focus a domain' });
  await expect(settings).toHaveAttribute('aria-expanded', 'false');
  await expect(domain).toBeHidden();
  await settings.press('Enter');
  await expect(domain).toBeVisible();
  await page.getByRole('button', { name: 'Topics', exact: true }).click();
  const domains = page.getByRole('button', {
    name: 'Browse domains',
    exact: true,
  });
  await expect(domains).toBeVisible();
  if ((await domains.getAttribute('aria-expanded')) === 'true')
    await domains.click();
  await page.getByRole('button', { name: 'Overview', exact: true }).click();
  if ((page.viewportSize()?.width ?? 0) <= 1280) {
    await expect(domains).toHaveAttribute('aria-expanded', 'true');
  }
  await domain.selectOption({ label: 'Curves & spreads' });
  await page.getByRole('button', { name: 'All concepts', exact: true }).click();
  await settings.press('Enter');
  await expect(domain).toBeHidden();
  await page
    .getByRole('button', { name: 'Back to overview', exact: true })
    .click();

  const search = page.getByRole('searchbox', {
    name: 'Search mortgage concepts',
  });
  await search.fill('OAS');
  await expect(
    page.getByRole('button', {
      name: 'Option-adjusted spread Curves & spreads / What a spread holds fixed',
      exact: true,
    }),
  ).toBeVisible();
  await search.press('Enter');
  const reader = page.getByRole('complementary', { name: 'Concept reader' });
  await expect(reader.getByRole('heading', { level: 2 })).toHaveText(
    'Option-adjusted spread',
  );
  const browse = page.getByRole('button', {
    name: 'Browse concepts',
    exact: true,
  });
  const narrow = (page.viewportSize()?.width ?? 0) <= 800;
  await expect(browse).toHaveAttribute('aria-expanded', String(narrow));
  await expect(page.locator('.atlas-canvas-caption')).toHaveCount(0);

  await page.getByRole('button', { name: 'Expand map', exact: true }).click();
  if (!narrow) {
    const atlas = await page.getByRole('dialog').boundingBox();
    const canvas = await page.getByRole('application').boundingBox();
    expect(canvas!.y - atlas!.y).toBeLessThanOrEqual(300);
    await expect(page.getByRole('group', { name: 'Atlas subject' })).toHaveCount(0);
    await test_info.attach('expanded-navigation', { body: await page.screenshot(), contentType: 'image/png' });
    await browse.press('Enter');
  }
  const navigator = page.getByRole('navigation', {
    name: 'Browse map at readable size',
  });
  const sibling = navigator.getByRole('button', {
    name: 'Z-spread',
    exact: true,
  });
  await sibling.click();
  await expect(reader.getByRole('heading', { level: 2 })).toHaveText(
    'Z-spread',
  );
  await page
    .getByRole('button', { name: 'Close concept reader', exact: true })
    .click();
  await expect(sibling).toBeFocused();
  await expect(browse).toHaveAttribute('aria-expanded', 'true');
  await page
    .getByRole('button', { name: 'Exit expanded map', exact: true })
    .click();
  await expect(
    page.getByRole('button', { name: 'Expand map', exact: true }),
  ).toBeFocused();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth - innerWidth,
    ),
  ).toBe(0);
});
