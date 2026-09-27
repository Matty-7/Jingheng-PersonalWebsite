import { test, expect } from '@playwright/test';
test.use({ javaScriptEnabled: false });

test('deep links and old links render selected content without JavaScript', async ({
  page,
}) => {
  for (const [url, title] of [
    [
      '/portfolio/new-york-atlas?entry=music%3Anew-york-state-of-mind%3Ariverside',
      'Riverside',
    ],
    [
      '/portfolio/nyc-music-map?track=cornelia-street&place=cornelia-street',
      'Cornelia Street',
    ],
    [
      '/portfolio/nyc-literary-map?work=gatsby&passage=queensboro-bridge',
      'Queensboro Bridge',
    ],
  ]) {
    await page.goto(url);
    await expect(page.locator('.atlas-card h2')).toHaveText(title);
    await expect(
      page.getByRole('link', { name: 'Open in Google Maps' }),
    ).toBeVisible();
    await expect(
      page.getByRole('combobox', { name: 'Choose a place and work' }),
    ).toBeVisible();
  }
  await page.goto('/portfolio/new-york-atlas?q=no-such-work-xyz&entry=invalid');
  await expect(
    page.getByRole('heading', { name: 'No connections found.' }),
  ).toBeVisible();
  await expect(page.locator('.atlas-card')).toHaveCount(0);
});
