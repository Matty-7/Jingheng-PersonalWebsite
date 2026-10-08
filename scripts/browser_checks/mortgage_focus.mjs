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
  const search = surface.getByRole('searchbox', {
    name: 'Search mortgage concepts',
  });
  const dialog = surface.getByRole('dialog');
  const pointer_open = async (trigger) => {
    await trigger.evaluate((element) => {
      if (document.activeElement instanceof HTMLElement)
        document.activeElement.blur();
      element.dispatchEvent(
        new PointerEvent('pointerdown', {
          bubbles: true,
          pointerType: 'mouse',
        }),
      );
      element.dispatchEvent(
        new PointerEvent('pointerup', { bubbles: true, pointerType: 'mouse' }),
      );
      element.dispatchEvent(
        new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          view: window,
        }),
      );
    });
  };
  for (const trigger_name of ['Search concepts', 'All topics']) {
    for (const open_method of ['pointer', 'keyboard']) {
      for (const close_method of ['escape', 'close']) {
        const trigger = button(trigger_name);
        await surface.locator('#learning-title').focus();
        if (open_method === 'pointer') await pointer_open(trigger);
        else await trigger.press('Enter');
        await search.waitFor({ state: 'visible' });
        assert.equal(
          await surface.locator('input[type="search"]:focus').count(),
          1,
        );
        if (close_method === 'escape') await search.press('Escape');
        else if (open_method === 'pointer')
          await button('Close all topics').click();
        else await button('Close all topics').press('Enter');
        await dialog.waitFor({ state: 'detached' });
        const focused_trigger =
          trigger_name === 'Search concepts'
            ? 'button[aria-label="Search concepts"]:focus'
            : '.learning-header nav > button.learning-text-button:focus';
        await surface.locator(focused_trigger).waitFor({ state: 'attached' });
        assert.equal(
          await trigger.evaluate(
            (element) => element.ownerDocument.activeElement === element,
          ),
          true,
          `${trigger_name} should regain focus after ${open_method} open and ${close_method} close`,
        );
      }
    }
  }
  await button('Search concepts').press('Enter');
  await search.waitFor({ state: 'visible' });
  assert.equal(await surface.locator('input[type="search"]:focus').count(), 1);
  await search.fill('zzzz_nomatch');
  await surface
    .locator('.learning-search-results')
    .waitFor({ state: 'visible' });
  assert.match(await surface.getByRole('dialog').innerText(), /No match/);
  await search.press('Escape');
  await dialog.waitFor({ state: 'detached' });
  await surface
    .locator('button[aria-label="Search concepts"]:focus')
    .waitFor({ state: 'attached' });
  await button('Search concepts').press('Enter');
  await search.fill('SMM');
  await surface
    .locator('.learning-search-results button')
    .first()
    .waitFor({ state: 'visible' });
  await search.press('Enter');
  await surface
    .getByRole('heading', { name: 'SMM', exact: true })
    .waitFor({ state: 'visible' });
  await surface.locator('#learning-title:focus').waitFor({ state: 'attached' });
  await button('All topics').press('Enter');
  // Loading the catalog changes its final focusable control. Check the
  // wrap only after the complete topic list has replaced the loading state.
  await surface
    .locator('.learning-domains > details > summary')
    .last()
    .waitFor({ state: 'visible' });
  await button('Close all topics').press('Shift+Tab');
  assert.equal(await surface.getByRole('dialog').locator(':focus').count(), 1);
  await dialog.locator(':focus').press('Tab');
  assert.equal(
    await surface
      .locator('button[aria-label="Close all topics"]:focus')
      .count(),
    1,
  );
  await dialog.locator(':focus').press('Escape');
  await dialog.waitFor({ state: 'detached' });
  return {
    viewport,
    catalog_focus: 'PASS',
    invoker_return: 'PASS',
    escape: 'PASS',
    lesson_focus: 'PASS',
  };
}
