import { test, expect } from '@playwright/test';
import { open_home, expect_loaded_images } from './home_helpers';

test.use({ reducedMotion: 'reduce' });

test('books drag, cancel, move with arrows and restore focus after reading', async ({
  page,
}) => {
  await open_home(page);
  await page.locator('#books').scrollIntoViewIfNeeded();
  const books = page.locator('.bookshelf-book');
  const order = () =>
    books.evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute('data-book-slug')),
    );
  await expect(books).toHaveCount(10);
  await expect_loaded_images(page, '.bookshelf img');
  const original = await order();
  const first = page.locator(`[data-book-slug="${original[0]}"]`);
  const second = page.locator(`[data-book-slug="${original[1]}"]`);

  async function drag_to_second() {
    await first.scrollIntoViewIfNeeded();
    const from = await first.boundingBox();
    const to = await second.boundingBox();
    expect(from).not.toBeNull();
    expect(to).not.toBeNull();
    await page.mouse.move(
      from!.x + from!.width / 2,
      from!.y + from!.height / 2,
    );
    await page.mouse.down();
    await page.mouse.move(to!.x + to!.width / 2, to!.y + to!.height / 2, {
      steps: 12,
    });
    await expect(page.locator('.book-drag-ghost')).toBeVisible();
    await expect.poll(order).not.toEqual(original);
  }
  await drag_to_second();
  await page.mouse.up();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.locator('.book-drag-ghost')).toHaveCount(0);
  expect((await first.boundingBox())!.x).toBeGreaterThan(
    (await second.boundingBox())!.x,
  );
  await first.press('ArrowLeft');
  await expect.poll(order).toEqual(original);

  await drag_to_second();
  await page.keyboard.press('Escape');
  await page.mouse.up();
  await expect.poll(order).toEqual(original);
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await first.press('ArrowRight');
  await expect
    .poll(order)
    .toEqual([original[1], original[0], ...original.slice(2)]);
  await first.press('Enter');
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(first).toBeFocused();
});
