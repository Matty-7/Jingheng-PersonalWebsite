import { test, expect } from '@playwright/test';

test('dollar-roll cash-flow comparison survives keyboard, cross-lens history and deep links', async ({ page }, test_info) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/portfolio/mortgage-map');
  const subjects = page.getByRole('group', { name: 'Atlas subject' });
  await subjects.getByRole('button', { name: 'Rates', exact: true }).click();
  const search = page.getByRole('searchbox', { name: 'Search mortgage concepts' });
  await search.fill('repo');
  await search.press('Enter');
  const reader = page.getByRole('complementary', { name: 'Concept reader' });
  await expect(reader.getByRole('heading', { level: 2 })).toHaveText('Repurchase financing');
  await expect(subjects.getByRole('button', { name: 'Rates', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await reader.getByRole('button', { name: 'Dollar rolls', exact: true }).press('Enter');
  await expect(reader.getByRole('heading', { level: 2 })).toHaveText('Dollar rolls');
  await expect(subjects.getByRole('button', { name: 'All fixed income', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(reader).toContainText('not a 0.25% investment return');
  await expect(reader.locator('.katex-mathml')).toHaveCount(1);
  await reader.getByRole('button', { name: 'Reveal answer', exact: true }).press('Enter');
  await expect(reader).toContainText('Forgone payments can outweigh the drop and any funding benefit');
  await reader.getByRole('button', { name: 'Previous concept', exact: true }).click();
  await expect(reader.getByRole('heading', { level: 2 })).toHaveText('Repurchase financing');
  await reader.getByRole('button', { name: 'Next concept in history', exact: true }).click();
  await expect(page).toHaveURL(/#concept=rolls$/);
  await page.reload();
  await expect(reader.getByRole('heading', { level: 2 })).toHaveText('Dollar rolls');
  for (const title of ['Cash-flow components', 'Prepayments', 'Delivery option', 'Repurchase financing']) {
    await expect(reader.getByRole('button', { name: title, exact: true })).toBeVisible();
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);
  await test_info.attach('dollar-roll-reader', { body: await page.screenshot({ fullPage: true }), contentType: 'image/png' });
});
