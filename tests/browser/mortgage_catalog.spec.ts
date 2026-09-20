import { test, expect } from '@playwright/test';

test('Mortgage Map unifies all domains, reading history and guided paths', async ({ page }, test_info) => {
  await page.goto('/portfolio/mortgage-map');
  await expect(page.getByRole('group', { name: 'Atlas subject' })).toHaveCount(0);
  await expect(page.locator('.node-root strong')).toHaveText('Mortgage Map');
  await page.getByRole('button', { name: 'List', exact: true }).click();
  await expect(page.getByRole('button', { name: /Corporate bonds/ })).toHaveCount(1);
  await expect(page.getByRole('button', { name: /Collateralized loan obligations/ })).toHaveCount(1);
  await page.getByRole('button', { name: 'Map', exact: true }).click();
  const search = page.getByRole('searchbox', { name: 'Search mortgage concepts' });
  await search.fill('IRS');
  await search.press('Enter');
  const reader = page.getByRole('complementary', { name: 'Concept reader' });
  await expect(reader.getByRole('heading', { level: 2 })).toHaveText('Interest-rate swap');
  await search.fill('HELOC');
  await search.press('Enter');
  await expect(reader.getByRole('heading', { level: 2 })).toContainText('HELOC');
  await reader.getByRole('button', { name: 'Previous concept', exact: true }).click();
  await expect(reader.getByRole('heading', { level: 2 })).toHaveText('Interest-rate swap');
  await reader.getByRole('button', { name: 'Next concept in history' }).click();
  await expect(reader.getByRole('heading', { level: 2 })).toContainText('HELOC');
  await page.reload();
  await expect(reader.getByRole('heading', { level: 2 })).toContainText('HELOC');
  await page.getByRole('button', { name: 'Paths', exact: true }).click();
  await page.getByRole('button', { name: /Why a rate cut need not lower mortgage rates/ }).click();
  await expect(page.locator('.atlas-stepper-top')).toContainText('Step 1 of 6');
  await page.getByRole('button', { name: 'Next guided step' }).click();
  await expect(reader.getByRole('heading', { level: 2 })).toHaveText('Expected policy path');
  for (const title of ['Term premium', 'Current-coupon MBS']) {
    await reader.getByRole('button', { name: 'Next path step' }).click();
    await expect(reader.getByRole('heading', { level: 2 })).toHaveText(title);
  }
  await expect(reader.locator('.atlas-reader-step-explanation')).toContainText('secondary mortgage yield');
  await reader.getByRole('button', { name: 'Close concept reader' }).click();
  await expect(page.locator('.atlas-stepper-top')).toContainText('Step 4 of 6');
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);
  await test_info.attach('mortgage-guided-path', { body: await page.screenshot({ fullPage: true }), contentType: 'image/png' });
});

test('guided reveal respects reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/portfolio/mortgage-map');
  await page.getByRole('button', { name: 'Paths', exact: true }).click();
  await page.getByRole('button', { name: /Why a rate cut need not lower mortgage rates/ }).click();
  await expect(page.locator('.atlas-step-detail')).toHaveCSS('animation-name', 'none');
});
