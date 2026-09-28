'use client';

import { useLayoutEffect, useRef, type RefObject } from 'react';

export function useAtlasCardMotion(
  card: RefObject<HTMLElement | null>,
  entry_id: string | null,
) {
  const previous = useRef<{
    id: string | null;
    snapshot: HTMLElement | null;
    parent: HTMLElement | null;
  } | null>(null);
  const cleanup = useRef(() => {});

  useLayoutEffect(() => {
    const element = card.current;
    const reduced_motion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    );
    const last = previous.current;
    if (last && last.id !== entry_id) {
      cleanup.current();
      if (!reduced_motion.matches) {
        const outgoing = last.snapshot;
        const animations: Animation[] = [];
        if (outgoing && last.parent?.isConnected) {
          last.parent.appendChild(outgoing);
          const exit = outgoing.animate(
            [
              { opacity: 1, translate: '0 0' },
              { opacity: 0, translate: '0 8px' },
            ],
            { duration: 120, easing: 'ease-in', fill: 'forwards' },
          );
          exit.onfinish = () => outgoing.remove();
          animations.push(exit);
        }
        if (element) {
          animations.push(
            element.animate(
              [
                { opacity: 0, translate: '0 10px' },
                { opacity: 1, translate: '0 0' },
              ],
              {
                duration: 240,
                delay: outgoing ? 60 : 0,
                easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
                fill: 'backwards',
              },
            ),
          );
        }
        const cancel = () => {
          animations.forEach((animation) => animation.cancel());
          outgoing?.remove();
          reduced_motion.removeEventListener('change', cancel);
        };
        reduced_motion.addEventListener('change', cancel);
        cleanup.current = cancel;
      }
    }
    // The exit layer is visual only; the live card updates immediately and keeps focus.
    const snapshot = element?.cloneNode(true) as HTMLElement | undefined;
    if (snapshot && element) {
      snapshot.classList.replace('atlas-card', 'atlas-card-snapshot');
      snapshot.setAttribute('aria-hidden', 'true');
      snapshot.inert = true;
      snapshot.removeAttribute('id');
      snapshot
        .querySelectorAll('[id]')
        .forEach((child) => child.removeAttribute('id'));
      snapshot.style.height = `${element.offsetHeight}px`;
      snapshot.style.pointerEvents = 'none';
    }
    previous.current = {
      id: entry_id,
      snapshot: snapshot ?? null,
      parent: element?.parentElement ?? null,
    };
  });

  useLayoutEffect(() => () => cleanup.current(), []);
}
