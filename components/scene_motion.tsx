'use client';

import { Pause, Play } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export function useSceneMotion() {
  const scene = useRef<HTMLDivElement>(null);
  const [paused, set_paused] = useState(false);
  const [ready, set_ready] = useState(false);

  useEffect(() => {
    const element = scene.current;
    if (!element || !('IntersectionObserver' in window)) return;
    let in_view = false;
    const update_visibility = () => {
      element.dataset.visible = String(in_view && !document.hidden);
    };
    const observer = new IntersectionObserver(([entry]) => {
      in_view = entry.isIntersecting;
      update_visibility();
    });
    observer.observe(element);
    document.addEventListener('visibilitychange', update_visibility);
    set_ready(true);
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', update_visibility);
    };
  }, []);

  return { scene, paused, ready, toggle: () => set_paused((value) => !value) };
}

export function SceneMotionControl({
  paused,
  toggle,
  subject,
}: {
  paused: boolean;
  toggle: () => void;
  subject: 'room' | 'desk';
}) {
  const label = `${paused ? 'Resume' : 'Pause'} ${subject} animation`;
  return (
    <button
      type="button"
      className="scene-motion-toggle"
      onClick={toggle}
      aria-label={label}
      title={label}
    >
      {paused ? (
        <Play size={17} aria-hidden="true" />
      ) : (
        <Pause size={17} aria-hidden="true" />
      )}
    </button>
  );
}
