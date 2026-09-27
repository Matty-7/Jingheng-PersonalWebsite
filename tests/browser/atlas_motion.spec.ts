import { test, expect } from '@playwright/test';
import { mock_map, select_search, atlas_path } from './atlas_helpers';

for (const reduced_motion of ['no-preference', 'reduce'] as const) {
  test(`selection centers above the card and rapid work changes settle (${reduced_motion})`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: reduced_motion });
    await mock_map(page);
    await page.goto(`${atlas_path}?entry=film%3Alibrary%3Aghostbusters`);
    await expect(page.getByRole('searchbox')).toBeEnabled();
    const card = page.locator('.atlas-card');
    const works = card.getByRole('navigation', { name: 'Works at this place' });
    const seinfeld = works.getByRole('button', {
      name: 'Seinfeld',
      exact: true,
    });
    await seinfeld.focus();
    await seinfeld.press('Enter');
    await works
      .getByRole('button', { name: 'Ghostbusters', exact: true })
      .press('Enter');
    await seinfeld.press('Enter');
    await expect(seinfeld).toBeFocused();
    await expect(seinfeld).toHaveAttribute('aria-pressed', 'true');
    await expect(card).toHaveAttribute('aria-busy', 'false');
    await expect(page.locator('.atlas-card-snapshot')).toHaveCount(0);
    if (reduced_motion === 'reduce') {
      expect(
        await card.evaluate((element) => element.getAnimations().length),
      ).toBe(0);
    }
    await select_search(page, 'cafe lalo');
    await expect(card.locator('h2')).toHaveText('Café Lalo');
    await expect(card).toHaveAttribute('aria-busy', 'false');
    await expect(page.locator('.atlas-selected-point')).toBeVisible();
    await expect
      .poll(async () => {
        const pin = (await page
          .locator('.atlas-selected-point')
          .boundingBox())!;
        const map = (await page.locator('.atlas-map').boundingBox())!;
        const panel = (await card.boundingBox())!;
        return Math.max(
          Math.abs(pin.x + pin.width / 2 - (map.x + map.width / 2)),
          Math.abs(pin.y + pin.height / 2 - (map.y + (panel.y - map.y) / 2)),
        );
      })
      .toBeLessThan(4);
    await page.getByRole('button', { name: 'Close place card' }).click();
    await expect(card).toHaveCount(0);
    await expect(page.locator('.atlas-card-snapshot')).toHaveCount(0);
  });
}
