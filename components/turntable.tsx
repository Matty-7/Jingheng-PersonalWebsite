'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useImageStatus } from '@/components/image_status';
import { Tonearm } from '@/components/tonearm';

export function Turntable({
  playing,
  artwork,
}: {
  playing: boolean;
  artwork: string;
}) {
  const turntable_ref = useRef<HTMLDivElement>(null);
  const [active, set_active] = useState(false);

  useEffect(() => {
    const element = turntable_ref.current;
    if (!element) return;
    if (typeof window.IntersectionObserver !== 'function') {
      const activation_frame = window.requestAnimationFrame(() =>
        set_active(true),
      );
      return () => window.cancelAnimationFrame(activation_frame);
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          set_active(true);
          observer.disconnect();
        }
      },
      { rootMargin: '600px 0px', threshold: 0 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={turntable_ref}
      className={`turntable ${playing ? 'is-playing' : ''}`}
      aria-hidden="true"
    >
      {active && <TurntableArtwork artwork={artwork} />}
    </div>
  );
}

function TurntableArtwork({ artwork }: { artwork: string }) {
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
      className="turntable-artwork"
      data-image-ready={base_state === 'loaded' && mask_state === 'loaded'}
    >
      <Image
        unoptimized
        className="turntable-base"
        ref={base_ref}
        onLoad={base_load}
        onError={base_error}
        src="/images/turntable-base.jpg"
        loading="eager"
        width={1448}
        height={1086}
        alt=""
      />
      <Image
        unoptimized
        className="turntable-mask-probe"
        src="/images/turntable.png"
        ref={mask_ref}
        onLoad={mask_load}
        onError={mask_error}
        loading="eager"
        width={1}
        height={1}
        alt=""
      />
      <div className="vinyl-disc">
        <div className="vinyl-spin">
          <Image unoptimized src={artwork} alt="" width={160} height={160} />
        </div>
      </div>
      <Tonearm />
    </div>
  );
}
