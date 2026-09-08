'use client';

import { useEffect, useRef, useState } from 'react';

export function useImageStatus() {
  const image_ref = useRef<HTMLImageElement>(null);
  const [state, set_state] = useState<'pending' | 'loaded' | 'error'>('pending');

  useEffect(() => {
    const image = image_ref.current;
    if (image?.complete) {
      set_state(image.naturalWidth > 0 ? 'loaded' : 'error');
    }
  }, []);

  return {
    image_ref,
    state,
    on_load: () => set_state('loaded'),
    on_error: () => set_state('error'),
  };
}
