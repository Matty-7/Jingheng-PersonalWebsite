import { test, expect } from '@playwright/test';
import { open_home, expect_loaded_images } from './home_helpers';

test.use({ reducedMotion: 'reduce' });

// Geometric visual contracts survive harmless font rasterization differences.
// Screenshots are retained for review; they are not unreviewed pixel goldens.
test('home keeps navigation, hero invitation and collection artwork visible', async ({
  page,
}, test_info) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await open_home(page);
  const viewport = page.viewportSize()!;
  const links = page.locator('.home-nav .nav-links > a');
  await expect(links).toHaveCount(8);
  const geometry = await links.evaluateAll((nodes) =>
    nodes.map((node) => {
      const r = node.getBoundingClientRect();
      return {
        x: r.x,
        y: r.y,
        width: r.width,
        height: r.height,
        right: r.right,
      };
    }),
  );
  expect(
    geometry.every(
      (r) => r.x >= 0 && r.right <= viewport.width && r.height >= 44,
    ),
  ).toBe(true);
  const rows = [...new Set(geometry.map((r) => r.y))];
  expect(rows).toHaveLength(viewport.width < 760 ? 2 : 1);
  if (viewport.width < 760) {
    expect(geometry.filter((r) => r.y === rows[0])).toHaveLength(4);
    expect(geometry.filter((r) => r.y === rows[1])).toHaveLength(4);
    const nav = await page.locator('.home-nav').boundingBox();
    expect(nav!.height).toBe(112);
  }
  for (let i = 1; i < geometry.length; i++) {
    if (geometry[i].y === geometry[i - 1].y)
      expect(geometry[i].x).toBeGreaterThanOrEqual(geometry[i - 1].right);
  }
  await expect(page.locator('.scroll-invitation')).toBeInViewport({ ratio: 1 });
  await expect(page.getByRole('heading', { level: 1 })).toBeInViewport({
    ratio: 1,
  });
  const overflow = () =>
    page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    );
  expect(await overflow()).toBe(0);
  // Reduced motion deliberately hides lazy decorative layers. Verify the
  // visible artwork and the disabled effects rather than requiring hidden loads.
  await expect_loaded_images(page, '.arrival .room-background');
  await expect(page.locator('.room-effects')).toHaveCSS('display', 'none');
  await test_info.attach('home-first-fold', {
    body: await page.screenshot({ animations: 'disabled' }),
    contentType: 'image/png',
  });

  await page.locator('#records').scrollIntoViewIfNeeded();
  await expect(page.locator('.turntable')).toHaveAttribute(
    'data-image-ready',
    'true',
  );
  await expect(page.locator('.record-row')).toHaveCount(10);
  await expect_loaded_images(page, '#records img');
  const room = await page.locator('.listening-room').boundingBox();
  expect(room!.width).toBeLessThanOrEqual(viewport.width);
  await test_info.attach('record-player', {
    body: await page
      .locator('.listening-room')
      .screenshot({ animations: 'disabled' }),
    contentType: 'image/png',
  });

  await page.locator('#books').scrollIntoViewIfNeeded();
  await expect(page.locator('.bookshelf-book')).toHaveCount(10);
  await expect_loaded_images(page, '.bookshelf img');
  const slots = await page.locator('.shelf-slot').evaluateAll((nodes) =>
    nodes.map((node) => {
      const r = node.getBoundingClientRect();
      return { x: r.x, y: r.y, width: r.width };
    }),
  );
  expect(slots.every((r) => r.x >= 0 && r.x + r.width <= viewport.width)).toBe(
    true,
  );
  expect(new Set(slots.map((r) => r.y)).size).toBe(
    viewport.width < 760 ? 5 : 2,
  );
  expect(await overflow()).toBe(0);
  await test_info.attach('bookshelf', {
    body: await page
      .locator('.bookshelf')
      .screenshot({ animations: 'disabled' }),
    contentType: 'image/png',
  });
  expect(errors).toEqual([]);
});
