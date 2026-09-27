'use client';

import { useLayoutEffect, useRef, type RefObject } from 'react';

export const tree_connections = [
  ['node-before-0', 'node-current'],
  ['node-before-1', 'node-current'],
  ['node-current', 'node-after-0'],
  ['node-after-0', 'node-after-1'],
  ['node-current', 'node-branch'],
] as const;

type NodePosition = {
  element: HTMLElement;
  left: number;
  top: number;
  width: number;
  height: number;
  opacity: number;
};

// Keep the last painted positions, including an interrupted transition. React
// owns the real buttons; this hook only animates them and draws their links.
export function useLearningTreeMotion(
  tree_ref: RefObject<HTMLElement | null>,
  lesson_key: string,
  loaded: boolean,
) {
  const positions = useRef(new Map<string, NodePosition>());
  const can_animate = useRef(false);

  useLayoutEffect(() => {
    const tree = tree_ref.current;
    if (!tree) return;
    const previous = positions.current;
    const nodes = [...tree.querySelectorAll<HTMLElement>('[data-concept-id]')];
    const reduced_motion = matchMedia('(prefers-reduced-motion: reduce)');
    const animations: Animation[] = [];
    const ghosts: HTMLElement[] = [];
    let frame = 0;

    function measure() {
      const bounds = tree!.getBoundingClientRect();
      const current = new Map<string, NodePosition>();
      for (const element of nodes) {
        if (!element.offsetWidth) continue;
        const rect = element.getBoundingClientRect();
        current.set(element.dataset.conceptId!, {
          element,
          left: rect.left - bounds.left,
          top: rect.top - bounds.top,
          width: rect.width,
          height: rect.height,
          opacity: Number(getComputedStyle(element).opacity),
        });
      }
      return current;
    }

    function draw() {
      positions.current = measure();
      for (const [from, to] of tree_connections) {
        const path = tree!.querySelector<SVGPathElement>(
          `[data-connection="${from}-${to}"]`,
        );
        const source = nodes.find((node) => node.classList.contains(from));
        const target = nodes.find((node) => node.classList.contains(to));
        const a = source && positions.current.get(source.dataset.conceptId!);
        const b = target && positions.current.get(target.dataset.conceptId!);
        if (!a || !b) {
          path?.removeAttribute('d');
          continue;
        }
        const x1 = a.left + a.width;
        const y1 = a.top + a.height / 2;
        const x2 = b.left;
        const y2 = b.top + b.height / 2;
        const mid = (x1 + x2) / 2;
        path?.setAttribute(
          'd',
          `M${x1} ${y1} C${mid} ${y1} ${mid} ${y2} ${x2} ${y2}`,
        );
      }
    }

    const current = measure();
    if (can_animate.current && previous.size && !reduced_motion.matches) {
      for (const [id, next] of current) {
        const old = previous.get(id);
        animations.push(
          next.element.animate(
            old
              ? [
                  {
                    opacity: old.opacity,
                    transform: `translate(${old.left - next.left}px, ${old.top - next.top}px) scale(${old.width / next.width}, ${old.height / next.height})`,
                  },
                  { opacity: 1, transform: 'none' },
                ]
              : [
                  { opacity: 0, transform: 'translateX(12px)' },
                  { opacity: 1, transform: 'none' },
                ],
            { duration: 300, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
          ),
        );
      }
      for (const [id, old] of previous) {
        if (current.has(id)) continue;
        // A departing card is decorative only, never a duplicate focus target.
        const ghost = old.element.cloneNode(true) as HTMLElement;
        ghost.removeAttribute('data-concept-id');
        ghost.removeAttribute('aria-current');
        ghost.setAttribute('aria-hidden', 'true');
        ghost.inert = true;
        ghost.classList.add('learning-node-exit');
        Object.assign(ghost.style, {
          position: 'absolute',
          left: `${old.left}px`,
          top: `${old.top}px`,
          width: `${old.width}px`,
          height: `${old.height}px`,
          gridArea: 'auto',
        });
        tree.appendChild(ghost);
        ghosts.push(ghost);
        const animation = ghost.animate(
          [{ opacity: old.opacity }, { opacity: 0 }],
          {
            duration: 140,
            fill: 'forwards',
          },
        );
        animation.onfinish = () => ghost.remove();
        animations.push(animation);
      }
    }

    can_animate.current = loaded;

    function tick() {
      draw();
      if (animations.some((animation) => animation.playState === 'running'))
        frame = requestAnimationFrame(tick);
    }
    function settle() {
      cancelAnimationFrame(frame);
      animations.forEach((animation) => animation.cancel());
      ghosts.forEach((ghost) => ghost.remove());
      draw();
    }
    // Read transformed positions before the first paint, then keep connectors
    // attached to the moving cards without rendering React on every frame.
    tick();
    let width = tree.offsetWidth;
    let height = tree.offsetHeight;
    const observer = new ResizeObserver(() => {
      if (width !== tree.offsetWidth || height !== tree.offsetHeight) {
        width = tree.offsetWidth;
        height = tree.offsetHeight;
        settle();
      } else {
        draw();
      }
    });
    observer.observe(tree);
    reduced_motion.addEventListener('change', settle);
    return () => {
      cancelAnimationFrame(frame);
      animations.forEach((animation) => animation.cancel());
      ghosts.forEach((ghost) => ghost.remove());
      observer.disconnect();
      reduced_motion.removeEventListener('change', settle);
    };
  }, [lesson_key, loaded, tree_ref]);
}
