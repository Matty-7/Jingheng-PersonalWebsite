import { test } from '@playwright/test';
import { check_mortgage_analytics_surface } from '../../scripts/browser_checks/mortgage_analytics.mjs';

test('analytics terminology connects search, metric comparison and explained paths', async ({ page }) => {
  await page.goto('/portfolio/mortgage-map');
  await check_mortgage_analytics_surface(page);
});
