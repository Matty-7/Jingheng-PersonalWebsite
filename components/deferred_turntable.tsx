'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useImageStatus } from '@/components/image_status';
import { Tonearm } from '@/components/tonearm';

function TurntableArtwork({
  artwork,
  playing,
}: {
  artwork: string;
  playing: boolean;
}) {
  const {
    image_ref: base_ref,
    state: base_state,
    on_load: base_load,
    on_error: base_error,
  } = useImageStatus();
  const {
    image_ref: mask_ref,
    state: mask_state,
    on_load: mask_load,
    on_error: mask_error,
  } = useImageStatus();
  return (
    <div
      className={`turntable ${playing ? 'is-playing' : ''}`}
      data-image-ready={base_state === 'loaded' && mask_state === 'loaded'}
      aria-hidden="true"
    >
      <Image
        unoptimized
        className="turntable-base"
        ref={base_ref}
        onLoad={base_load}
        onError={base_error}
        src="/images/turntable-base.jpg"
        width={1448}
        height={1086}
        alt=""
        loading="eager"
      />
      <Image
        unoptimized
        className="turntable-mask-probe"
        ref={mask_ref}
        onLoad={mask_load}
        onError={mask_error}
        src="/images/turntable.png"
        width={1}
        height={1}
        alt=""
        loading="eager"
      />
      <div className="vinyl-disc">
        <div className="vinyl-spin">
          <Image unoptimized src={artwork} width={160} height={160} alt="" />
        </div>
      </div>
      <Tonearm />
    </div>
  );
}

export function DeferredTurntable({
  artwork,
  playing,
}: {
  artwork: string;
  playing: boolean;
}) {
  const reservation = useRef<HTMLDivElement>(null);
  const [mounted, set_mounted] = useState(false);
  useEffect(() => {
    if (!('IntersectionObserver' in window)) {
      let disposed = false;
      queueMicrotask(() => {
        if (!disposed) set_mounted(true);
      });
      return () => {
        disposed = true;
      };
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        set_mounted(true);
        observer.disconnect();
      },
      { rootMargin: '600px 0px' },
    );
    if (reservation.current) observer.observe(reservation.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={reservation}>
      {mounted ? (
        <TurntableArtwork artwork={artwork} playing={playing} />
      ) : (
        <div
          className="turntable"
          data-image-ready="false"
          aria-hidden="true"
        />
      )}
    </div>
  );
}
