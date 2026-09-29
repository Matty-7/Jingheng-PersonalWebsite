import { test, expect } from '@playwright/test';

test('a selected node moves continuously and its connectors stay attached', async ({
  page,
}) => {
  await page.goto('/portfolio/mortgage-map?concept=dscr');
  await expect(page.locator('.mortgage-learning')).toHaveAttribute(
    'data-ready',
    'true',
  );
  const motion = await page.evaluate(async () => {
    const tree = document.querySelector<HTMLElement>('.learning-tree')!;
    const node = tree.querySelector<HTMLElement>('[data-concept-id="ltv"]')!;
    const rect = () => {
      const bounds = node.getBoundingClientRect();
      return { x: bounds.x, y: bounds.y };
    };
    const start = rect();
    node.click();
    // The animation starts when the requested lesson commits, after its fetch.
    const deadline = performance.now() + 5000;
    while (!node.classList.contains('is-current')) {
      if (performance.now() > deadline)
        throw new Error('Lesson did not commit');
      await new Promise(requestAnimationFrame);
    }
    const animations = tree.getAnimations({ subtree: true });
    for (const animation of animations) {
      animation.pause();
      animation.currentTime = 100;
    }
    await new Promise(requestAnimationFrame);
    const middle = rect();
    const retained = tree.querySelector('[data-concept-id="ltv"]') === node;
    const opacity = getComputedStyle(node).opacity;
    const bounds = tree.getBoundingClientRect();
    const connector_errors = [
      ...tree.querySelectorAll<SVGPathElement>('path[d]'),
    ].map((path) => {
      const [from, to] = path.dataset.connection!.split(/-(?=node-)/);
      const source = tree
        .querySelector<HTMLElement>(`.${from}`)!
        .getBoundingClientRect();
      const target = tree
        .querySelector<HTMLElement>(`.${to}`)!
        .getBoundingClientRect();
      const first = path.getPointAtLength(0);
      const last = path.getPointAtLength(path.getTotalLength());
      return Math.max(
        Math.abs(first.x - (source.right - bounds.left)),
        Math.abs(first.y - (source.top + source.height / 2 - bounds.top)),
        Math.abs(last.x - (target.left - bounds.left)),
        Math.abs(last.y - (target.top + target.height / 2 - bounds.top)),
      );
    });
    animations.forEach((animation) => animation.finish());
    await new Promise(requestAnimationFrame);
    return { start, middle, end: rect(), retained, opacity, connector_errors };
  });
  expect(motion.retained).toBe(true);
  expect(motion.opacity).toBe('1');
  expect(
    Math.hypot(
      motion.middle.x - motion.start.x,
      motion.middle.y - motion.start.y,
    ),
  ).toBeGreaterThan(2);
  expect(
    Math.hypot(motion.middle.x - motion.end.x, motion.middle.y - motion.end.y),
  ).toBeGreaterThan(2);
  motion.connector_errors.forEach((error) => expect(error).toBeLessThan(1));
  await expect(page.locator('#learning-title')).toHaveText('LTV');
  await expect(page.locator('#learning-title')).toBeFocused();
});

test('rapid node changes and history settle on the last lesson without leftover cards', async ({
  page,
}) => {
  await page.goto('/portfolio/mortgage-map?concept=dscr');
  await expect(page.locator('.mortgage-learning')).toHaveAttribute(
    'data-ready',
    'true',
  );
  await page.locator('[data-concept-id="ltv"]').dispatchEvent('click');
  await page.locator('[data-concept-id="dscr"]').dispatchEvent('click');
  await page.locator('[data-concept-id="ltv"]').dispatchEvent('click');
  await expect(page.locator('#learning-title')).toHaveText('LTV');
  await expect(page.locator('.learning-node-exit')).toHaveCount(0);
  await expect
    .poll(() =>
      page
        .locator('.learning-tree')
        .evaluate((tree) => tree.getAnimations({ subtree: true }).length),
    )
    .toBe(0);
  await page.goBack();
  await expect(page.locator('#learning-title')).toHaveText('DSCR');
  await page.goForward();
  await expect(page.locator('#learning-title')).toHaveText('LTV');
  await expect(page.locator('.learning-node-exit')).toHaveCount(0);
  await expect(
    page.locator('.learning-tree [aria-current="step"]'),
  ).toHaveCount(1);
});

test('reduced motion changes the lesson immediately without tree animation', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/portfolio/mortgage-map?concept=dscr');
  await expect(page.locator('.mortgage-learning')).toHaveAttribute(
    'data-ready',
    'true',
  );
  await page.locator('[data-concept-id="ltv"]').click();
  await expect(page.locator('#learning-title')).toHaveText('LTV');
  expect(
    await page
      .locator('.learning-tree')
      .evaluate((tree) => tree.getAnimations({ subtree: true }).length),
  ).toBe(0);
  await expect(page.locator('.learning-node-exit')).toHaveCount(0);
});
