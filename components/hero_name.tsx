'use client';

import { useEffect, useRef, useState } from 'react';

const names = [
  { text: 'Jingheng\nHuan', language: 'en' },
  { text: '郇\n敬恒', language: 'zh-Hans' },
] as const;

export function HeroName({ paused }: { paused: boolean }) {
  const heading = useRef<HTMLHeadingElement>(null);
  const [active, set_active] = useState(false);
  const [frame, set_frame] = useState({
    language: 0,
    count: names[0].text.length,
    phase: 'hold',
  });

  useEffect(() => {
    const element = heading.current;
    // Match the scene's CSS fallback: never animate without its pause control.
    if (
      !element ||
      !('IntersectionObserver' in window) ||
      !window.CSS?.supports('width', '1cqw')
    )
      return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let in_view = false;
    const update = () =>
      set_active(in_view && !document.hidden && !reduced.matches && !paused);
    const observer = new IntersectionObserver(([entry]) => {
      in_view = entry.isIntersecting;
      update();
    });
    observer.observe(element);
    reduced.addEventListener('change', update);
    document.addEventListener('visibilitychange', update);
    update();
    return () => {
      observer.disconnect();
      reduced.removeEventListener('change', update);
      document.removeEventListener('visibilitychange', update);
    };
  }, [paused]);

  useEffect(() => {
    if (!active) return;
    const timer = window.setTimeout(
      () =>
        set_frame((current) => {
          if (current.phase === 'hold') return { ...current, phase: 'delete' };
          if (current.phase === 'delete')
            return current.count > 0
              ? { ...current, count: current.count - 1 }
              : { language: 1 - current.language, count: 0, phase: 'type' };
          const count = current.count + 1;
          return {
            ...current,
            count,
            phase:
              count >= names[current.language].text.length ? 'hold' : 'type',
          };
        }),
      frame.phase === 'hold' ? 4000 : frame.phase === 'delete' ? 70 : 120,
    );
    return () => window.clearTimeout(timer);
  }, [active, frame]);

  const name = names[frame.language];
  const visible = active ? name.text.slice(0, frame.count) : name.text;
  const [first, last = ''] = visible.split('\n');
  const cursor_line = visible.includes('\n') ? 1 : 0;
  return (
    <h1 className="hero-name" ref={heading}>
      <span className="sr-only">
        Jingheng Huan · <span lang="zh-Hans">郇敬恒</span>
      </span>
      <span
        className="typed-name"
        aria-hidden="true"
        lang={name.language}
        data-active={active}
      >
        <span className="typed-line">
          {first}
          {cursor_line === 0 && <span className="typing-caret" />}
        </span>
        <em className="typed-line">
          {last}
          {cursor_line === 1 && <span className="typing-caret" />}
        </em>
      </span>
    </h1>
  );
}
