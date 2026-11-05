import { test, expect } from '@playwright/test';

for (const reduced_motion of ['no-preference', 'reduce'] as const) {
  test(`MBS FX hedge sizing stays navigable (${reduced_motion})`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: reduced_motion });
    await page.setViewportSize(
      reduced_motion === 'reduce'
        ? { width: 390, height: 844 }
        : { width: 1280, height: 900 },
    );
    await page.goto(
      '/portfolio/mortgage-map?concept=fx_hedging#concept=fx_hedging',
    );

    const heading = page.getByRole('heading', {
      level: 2,
      name: 'Currency hedging',
      exact: true,
    });
    await expect(heading).toBeVisible();
    await page.getByText('Why it matters', { exact: true }).press('Enter');
    const depth = page.locator('.learning-depth');
    await expect(depth).toContainText('Original face is a static issuance');
    await expect(depth).toContainText('target FX hedge notional');
    await expect(depth).toContainText('not an optimal hedge');

    await depth
      .getByRole('button', {
        name: 'Factor month & publication date',
        exact: true,
      })
      .press('Enter');
    await expect(page.getByRole('heading', { level: 2 })).toHaveText(
      'Factor month & publication date',
    );
    await page.goBack();
    await expect(heading).toBeVisible();
    await page.getByText('Why it matters', { exact: true }).press('Enter');
    await depth
      .getByRole('button', { name: 'Supply and investor demand', exact: true })
      .press('Enter');
    await expect(page.getByRole('heading', { level: 2 })).toHaveText(
      'Supply and investor demand',
    );
    await page.goBack();
    await expect(heading).toBeVisible();

    const choices = page.getByRole('group', { name: 'Choose an answer' });
    await choices
      .getByRole('button', {
        name: /^No\. Allocation still depends/,
      })
      .press('Enter');
    await expect(page.locator('.learning-answer')).toContainText(
      'That’s right',
    );
    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth,
    );
    expect(overflow).toBe(false);
  });
}
