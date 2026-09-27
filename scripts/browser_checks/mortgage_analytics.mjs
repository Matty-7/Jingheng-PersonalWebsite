import assert from 'node:assert/strict';

export async function check_mortgage_analytics_surface(surface) {
  const button = (name) => surface.getByRole('button', { name, exact: true });
  for (const [query, title] of [
    ['MDR', 'MDR & CDR'],
    ['MPR', 'Monthly payment rate'],
    ['ABS speed', 'ABS prepayment speed'],
    ['effective convexity', 'Effective convexity'],
  ]) {
    await button('Search concepts').click();
    const search = surface.getByRole('searchbox', {
      name: 'Search mortgage concepts',
    });
    await search.fill(query);
    await search.press('Enter');
    await surface
      .getByRole('heading', { name: title, exact: true })
      .waitFor({ state: 'visible' });
    await surface.getByText('Why it matters', { exact: true }).click();
    await surface
      .locator('.learning-depth[open]')
      .waitFor({ state: 'visible' });
    if (query === 'MDR' || query === 'effective convexity')
      assert.equal(await surface.locator('.learning-math math').count(), 1);
    if (query === 'effective convexity')
      assert.match(
        await surface.locator('.learning-depth').innerText(),
        /fixed OAS/,
      );
    assert.ok(await surface.locator('.learning-sources a').count());
  }
  const overflow = await surface
    .locator('body')
    .evaluate(
      (el) =>
        el.ownerDocument.documentElement.scrollWidth -
        el.ownerDocument.defaultView.innerWidth,
    );
  assert.ok(overflow <= 0, 'The document must not overflow horizontally.');
  return {
    search: ['MDR', 'MPR', 'ABS speed', 'effective convexity'],
    formulas: 2,
    sources: 'PASS',
  };
}
