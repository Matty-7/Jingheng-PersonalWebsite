import assert from 'node:assert/strict';

export async function check_mortgage_focus(tab, viewport = 'desktop') {
  assert.ok(['desktop', 'mobile', 'short'].includes(viewport));
  assert.equal(
    await tab.url(),
    `http://terminal.local:4173/__audit/mortgage_${viewport}`,
  );
  return check_mortgage_focus_surface(
    tab.playwright.frameLocator('iframe'),
    viewport,
  );
}

export async function check_mortgage_focus_surface(
  surface,
  viewport = 'desktop',
) {
  const button = (name) => surface.getByRole('button', { name, exact: true });
  await button('Search concepts').press('Enter');
  const search = surface.getByRole('searchbox', {
    name: 'Search mortgage concepts',
  });
  await search.waitFor({ state: 'visible' });
  assert.equal(await surface.locator('input[type="search"]:focus').count(), 1);
  await search.fill('zzzz_nomatch');
  assert.match(await surface.getByRole('dialog').innerText(), /No match/);
  await search.press('Escape');
  await surface.getByRole('dialog').waitFor({ state: 'detached' });
  await surface
    .locator('button[aria-label="Search concepts"]:focus')
    .waitFor({ state: 'attached' });
  await button('Search concepts').press('Enter');
  await search.fill('SMM');
  await search.press('Enter');
  await surface
    .getByRole('heading', { name: 'SMM', exact: true })
    .waitFor({ state: 'visible' });
  await surface.locator('#learning-title:focus').waitFor({ state: 'attached' });
  await button('All topics').press('Enter');
  await button('Close all topics').press('Shift+Tab');
  assert.equal(await surface.getByRole('dialog').locator(':focus').count(), 1);
  await surface.getByRole('dialog').locator(':focus').press('Tab');
  assert.equal(
    await surface
      .locator('button[aria-label="Close all topics"]:focus')
      .count(),
    1,
  );
  await surface.getByRole('dialog').locator(':focus').press('Escape');
  await surface.getByRole('dialog').waitFor({ state: 'detached' });
  return {
    viewport,
    catalog_focus: 'PASS',
    escape: 'PASS',
    lesson_focus: 'PASS',
  };
}
