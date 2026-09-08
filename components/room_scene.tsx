'use client';

import Image from 'next/image';
import { Pause, Play } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export function RoomScene() {
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

  return (
    <>
      <div className="arrival-scene" ref={scene} data-paused={paused}>
        <div className="room-artboard">
          <Image
            unoptimized
            className="room-background"
            src="/images/living-room-motion.webp"
            fetchPriority="high"
            width={1672}
            height={941}
            alt="A sunny illustrated living room with coffee, a record player, Bloomberg Markets and The New Yorker magazines"
          />
          <div className="room-effects" aria-hidden="true">
            <div className="room-record">
              <div className="room-record-plane">
                <Image
                  unoptimized
                  className="room-vinyl room-motion"
                  src="/images/room-vinyl.webp"
                  width={512}
                  height={512}
                  alt=""
                />
              </div>
            </div>
            <Image
              unoptimized
              className="room-still room-tonearm"
              src="/images/living-room-motion.webp"
              width={1672}
              height={941}
              alt=""
            />
            <Image
              unoptimized
              className="room-still room-spindle"
              src="/images/living-room-motion.webp"
              width={1672}
              height={941}
              alt=""
            />
            <div className="room-coffee">
              <Image
                unoptimized
                className="room-steam room-motion"
                src="/images/room-steam.webp"
                width={256}
                height={512}
                alt=""
              />
              <Image
                unoptimized
                className="room-steam room-steam-late room-motion"
                src="/images/room-steam.webp"
                width={256}
                height={512}
                alt=""
              />
            </div>
          </div>
        </div>
      </div>
      {ready && (
        <button
          type="button"
          className="room-motion-toggle"
          onClick={() => set_paused((value) => !value)}
          aria-label={paused ? 'Resume room animation' : 'Pause room animation'}
          title={paused ? 'Resume room animation' : 'Pause room animation'}
        >
          {paused ? (
            <Play size={17} aria-hidden="true" />
          ) : (
            <Pause size={17} aria-hidden="true" />
          )}
        </button>
      )}
    </>
  );
}
