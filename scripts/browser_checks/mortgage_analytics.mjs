import assert from 'node:assert/strict';

// Shared rendered journey for the supported browser and CI. No hidden app state.
export async function check_mortgage_analytics_surface(surface) {
  const button = (name) => surface.getByRole('button', { name, exact: true });
  const search = surface.getByRole('searchbox', { name: 'Search mortgage concepts' });
  const reader = surface.getByRole('complementary', { name: 'Concept reader' });
  for (const [query, title] of [['MDR', 'MDR & CDR'], ['MPR', 'Monthly payment rate'], ['ABS speed', 'ABS prepayment speed']]) {
    await search.fill(query);
    await surface.getByRole('button', { name: new RegExp(`^${title} (Credit|Prepayment)`) }).waitFor({ state: 'visible' });
    await search.press('Enter');
    await reader.getByRole('heading', { name: title, exact: true }).waitFor({ state: 'visible' });
    if (query === 'MDR') assert.equal(await reader.locator('math').count(), 1);
    await button('Close concept reader').click();
  }

  await button('Compare').click();
  await button('Metrics').click();
  await surface.getByRole('heading', { name: 'A percentage is not a measurement contract.', exact: true }).waitFor({ state: 'visible' });
  await button('Read MPR').click();
  await reader.getByRole('heading', { name: 'Monthly payment rate', exact: true }).waitFor({ state: 'visible' });
  await button('Close concept reader').click();
  await button('Read MDR / CDR').click();
  await reader.getByRole('heading', { name: 'MDR & CDR', exact: true }).waitFor({ state: 'visible' });
  await button('Close concept reader').click();

  await button('Paths').click();
  await surface.getByRole('button', { name: /From an observed speed to scenario cash flows/ }).click();
  await surface.getByRole('heading', { name: 'From an observed speed to scenario cash flows', exact: true }).waitFor({ state: 'visible' });
  assert.equal(await surface.locator('.atlas-model-steps li').count(), 6);
  assert.match(await surface.locator('.atlas-model-boundary').innerText(), /Missing history/);
  await button('Assumption vector').click();
  await reader.getByRole('heading', { name: 'Assumption vector', exact: true }).waitFor({ state: 'visible' });
  await button('Close concept reader').click();
  await button('All paths').click();
  await surface.getByRole('button', { name: /Which input did the risk measure shock/ }).click();
  await button('Effective convexity').click();
  await reader.getByRole('heading', { name: 'Effective convexity', exact: true }).waitFor({ state: 'visible' });
  assert.equal(await reader.locator('math').count(), 1);
  assert.match(await reader.innerText(), /fixed OAS/);
  const geometry = await surface.locator('body').evaluate((el) => ({
    width: el.ownerDocument.defaultView.innerWidth,
    overflow: el.ownerDocument.documentElement.scrollWidth - el.ownerDocument.defaultView.innerWidth,
  }));
  assert.ok(geometry.overflow <= 0, 'The document must not overflow horizontally.');
  return { ...geometry, search: ['MDR', 'MPR', 'ABS speed'], comparison: 'Metrics', paths: 2, formulas: 2 };
}
