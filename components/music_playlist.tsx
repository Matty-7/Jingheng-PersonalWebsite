'use client';

import { useRef, useState } from 'react';
import { ArrowUpRight, Check, Copy, Download, ListMusic } from 'lucide-react';
import { music_tracks, track_places } from '@/lib/nyc_music_map';
import { playlist_text } from '@/lib/music_playlist';

export function MusicPlaylist() {
  const [open, set_open] = useState(false);
  const [copy_state, set_copy_state] = useState<'idle' | 'copied' | 'failed'>('idle');
  const copy_area = useRef<HTMLTextAreaElement>(null);

  async function copy_songs() {
    try {
      await navigator.clipboard.writeText(playlist_text(music_tracks));
      set_copy_state('copied');
    } catch {
      set_copy_state('failed');
      requestAnimationFrame(() => { copy_area.current?.focus(); copy_area.current?.select(); });
    }
  }

  return <section className="sound-playlist" aria-label="Full collection song list">
    <div className="sound-playlist-bar">
      <button className="sound-playlist-toggle" aria-expanded={open} aria-controls="sound-playlist-content" onClick={() => set_open(!open)}><ListMusic size={19} aria-hidden="true" />{open ? 'Close song list' : 'Songs on Apple Music'}<span>{music_tracks.length}</span></button>
      <a className="sound-export" href="/api/music-playlist" download="nyc_music_map.csv"><Download size={16} aria-hidden="true" />Export song list</a>
    </div>
    {open && <div id="sound-playlist-content" className="sound-playlist-content">
      <div className="sound-playlist-intro"><div><h2>New York, on record.</h2><p>All {music_tracks.length} songs, including those outside your search. Open any song in Apple Music, or take the list with you.</p><p className="sound-playlist-note">The exported list does not create a playlist in your Apple Music library.</p></div><button className="sound-export" onClick={() => void copy_songs()}>{copy_state === 'copied' ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}Copy song list</button></div>
      <output className="sound-copy-status" aria-live="polite">{copy_state === 'copied' ? `${music_tracks.length} songs copied.` : copy_state === 'failed' ? 'Select and copy the list below.' : ''}</output>
      {copy_state === 'failed' && <textarea ref={copy_area} className="sound-copy-area" readOnly aria-label="Song list to copy" value={playlist_text(music_tracks)} />}
      <ol className="sound-playlist-tracks">{music_tracks.map((track) => <li key={track.id}><a href={track.apple_music_url} target="_blank" rel="noopener noreferrer" aria-label={`Listen to ${track.title} by ${track.artist} on Apple Music`}><span><strong>{track.title}</strong><span>{track.artist} · {track_places(track).map((place) => place.name).join(', ')}</span></span><ArrowUpRight size={17} aria-hidden="true" /></a></li>)}</ol>
    </div>}
  </section>;
}
