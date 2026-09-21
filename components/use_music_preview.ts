'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { MusicTrack } from '@/lib/nyc_music_map';

export function useMusicPreview(track: MusicTrack | undefined) {
  const audio = useRef<HTMLAudioElement>(null);
  const request = useRef({ value: 0 });
  const pending = useRef(false);
  const [playing, set_playing] = useState(false);
  const [loading, set_loading] = useState(false);
  const [elapsed, set_elapsed] = useState(0);
  const [duration, set_duration] = useState(0);
  const [message, set_message] = useState('');

  const clear_audio = useCallback(() => {
    ++request.current.value;
    pending.current = false;
    const element = audio.current;
    if (element) {
      element.pause();
      element.removeAttribute('src');
      delete element.dataset.track;
      element.load();
    }
  }, []);

  const reset_progress = useCallback(() => {
    set_playing(false);
    set_loading(false);
    set_elapsed(0);
    set_duration(0);
    set_message('');
  }, []);

  const stop_preview = useCallback(() => {
    clear_audio();
    reset_progress();
  }, [clear_audio, reset_progress]);

  useEffect(() => {
    clear_audio();
  }, [track?.id, clear_audio]);

  useEffect(() => {
    const element = audio.current;
    const request_state = request.current;
    return () => {
      ++request_state.value;
      element?.pause();
      element?.removeAttribute('src');
      element?.load();
    };
  }, []);

  async function toggle_preview() {
    const element = audio.current;
    if (!element || !track) return;
    if (pending.current || !element.paused) {
      ++request.current.value;
      pending.current = false;
      element.pause();
      set_loading(false);
      set_playing(false);
      return;
    }
    const ticket = ++request.current.value;
    pending.current = true;
    set_loading(true);
    set_message('');
    if (element.dataset.track !== track.id) {
      element.src = track.preview_url;
      element.dataset.track = track.id;
      element.load();
    }
    if (element.ended) element.currentTime = 0;
    try {
      await element.play();
      if (ticket === request.current.value) set_playing(true);
    } catch (error) {
      if (ticket === request.current.value) {
        set_playing(false);
        set_message(
          error instanceof DOMException && error.name === 'NotAllowedError'
            ? 'Press play again to allow the preview.'
            : 'This preview is unavailable. You can still open the song on Apple Music.',
        );
      }
    } finally {
      if (ticket === request.current.value) {
        pending.current = false;
        set_loading(false);
      }
    }
  }

  const audio_events = {
    onEmptied() {
      // load() also emits emptied when starting a new, still-pending preview.
      if (!audio.current?.hasAttribute('src')) reset_progress();
    },
    onPlaying() {
      if (audio.current?.dataset.track === track?.id) {
        set_playing(true);
        set_loading(false);
      }
    },
    onPause: () => set_playing(false),
    onTimeUpdate: () => set_elapsed(audio.current?.currentTime ?? 0),
    onDurationChange() {
      const value = audio.current?.duration;
      set_duration(value && Number.isFinite(value) ? value : 0);
    },
    onEnded() {
      pending.current = false;
      set_playing(false);
      set_loading(false);
    },
    onError() {
      if (!audio.current?.hasAttribute('src')) return;
      ++request.current.value;
      pending.current = false;
      set_loading(false);
      set_playing(false);
      set_message(
        'This preview is unavailable. You can still open the song on Apple Music.',
      );
    },
  };
  return {
    audio,
    audio_events,
    playing,
    loading,
    elapsed,
    duration,
    message,
    stop_preview,
    toggle_preview,
  };
}
