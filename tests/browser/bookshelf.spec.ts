import { test, expect } from '@playwright/test';
import { open_home, expect_loaded_images } from './home_helpers';
import featured_books from '../../content/books.json' with { type: 'json' };

test.use({ reducedMotion: 'reduce' });

const dialog_chunk = /\/book_dialog-[^/]+\.js(?:\?.*)?$/;

test('book dialog code loads near the shelf and is reused across books', async ({
  page,
}) => {
  const requests: string[] = [];
  page.on('request', (request) => {
    if (dialog_chunk.test(request.url())) requests.push(request.url());
  });
  await open_home(page);
  await expect(page.locator('.bookshelf-book')).toHaveCount(10);
  expect(requests).toHaveLength(0);
  await page.locator('#books').scrollIntoViewIfNeeded();
  await expect.poll(() => requests.length).toBe(1);
  for (const book of featured_books.slice(0, 2)) {
    const trigger = page.locator(`[data-book-slug="${book.slug}"]`);
    await trigger.click();
    await expect(
      page.getByRole('dialog', { name: book.title, exact: true }),
    ).toBeVisible();
    await expect(page.locator('.open-book-quote')).toHaveText(
      `“${book.quote}”`,
    );
    await page.getByRole('button', { name: 'Close', exact: true }).click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(trigger).toBeFocused();
  }
  expect(requests).toHaveLength(1);
});

test('slow book loading can be cancelled and opens only the latest selection', async ({
  page,
}) => {
  await open_home(page);
  let release: () => void = () => {};
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route(dialog_chunk, async (route) => {
    await gate;
    await route.continue();
  });
  const first = page.locator(`[data-book-slug="${featured_books[0].slug}"]`);
  const second = page.locator(`[data-book-slug="${featured_books[1].slug}"]`);
  await first.click();
  await expect(page.locator('.book-dialog-status')).toContainText(
    `Opening ${featured_books[0].title}`,
  );
  await second.click();
  await expect(page.locator('.book-dialog-status')).toContainText(
    `Opening ${featured_books[1].title}`,
  );
  await page.keyboard.press('Escape');
  await expect(page.locator('.book-dialog-status')).toHaveCount(0);
  await expect(second).toBeFocused();
  const loaded = page.waitForResponse(dialog_chunk);
  release();
  await loaded;
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await second.press('Enter');
  await expect(
    page.getByRole('dialog', { name: featured_books[1].title, exact: true }),
  ).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(second).toBeFocused();
});

test('unavailable book dialog keeps passages readable and restores focus', async ({
  page,
}) => {
  await open_home(page);
  await page.route(dialog_chunk, (route) => route.abort('failed'));
  for (const book of featured_books.slice(0, 2)) {
    const trigger = page.locator(`[data-book-slug="${book.slug}"]`);
    await trigger.click();
    const passage = page.getByRole('region', { name: book.title, exact: true });
    await expect(passage).toBeVisible();
    await expect(passage).toBeFocused();
    await expect(passage.locator('blockquote')).toHaveText(`“${book.quote}”`);
    await expect(passage.locator('blockquote')).toHaveAttribute(
      'cite',
      book.quote_source,
    );
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await page
      .getByRole('button', { name: 'Close passage', exact: true })
      .click();
    await expect(passage).toHaveCount(0);
    await expect(trigger).toBeFocused();
  }
});

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
