import type { MusicTrack } from '@/lib/nyc_music_map';
import { atlas_music_platform_urls } from '@/lib/atlas_sources';

export function AtlasMusicLinks({ track }: { track: MusicTrack }) {
  const platform_urls = atlas_music_platform_urls(track);

  return (
    <nav className="atlas-music-links" aria-label="Music platforms">
      <a
        className="atlas-music-link atlas-music-link-apple"
        href={platform_urls.apple}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Listen to ${track.title} by ${track.artist} on Apple Music`}
        title="Listen on Apple Music"
      >
        <svg
          viewBox="0 0 24 24"
          width="24"
          height="24"
          fill="currentColor"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M17.6 2.4 8.4 4.3a1 1 0 0 0-.8 1v11.1c-.6-.2-1.4-.2-2.2 0-1.7.4-2.8 1.7-2.5 3 .3 1.4 1.9 2 3.6 1.6 1.5-.4 2.5-1.4 2.5-2.6V8.6l8-1.6v7.5c-.6-.2-1.4-.2-2.2 0-1.7.4-2.8 1.7-2.5 3 .3 1.4 1.9 2 3.6 1.6 1.5-.4 2.5-1.4 2.5-2.6V3.2c0-.5-.4-.9-.8-.8Z" />
        </svg>
      </a>
      <a
        className="atlas-music-link atlas-music-link-spotify"
        href={platform_urls.spotify}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Find ${track.title} by ${track.artist} on Spotify`}
        title="Find on Spotify"
      >
        <svg
          viewBox="0 0 24 24"
          width="26"
          height="26"
          fill="currentColor"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M12 0a12 12 0 1 0 0 24 12 12 0 0 0 0-24Zm5.5 17.3a.75.75 0 0 1-1.03.25c-2.83-1.73-6.39-2.12-10.58-1.16a.75.75 0 0 1-.33-1.46c4.58-1.05 8.51-.6 11.68 1.34.35.22.47.68.26 1.03Zm1.47-3.27a.94.94 0 0 1-1.29.31c-3.24-1.99-8.17-2.56-12-1.4a.94.94 0 0 1-.54-1.8c4.37-1.32 9.8-.68 13.52 1.6.44.27.58.85.31 1.29Zm.13-3.4C15.2 8.31 8.77 8.1 5.05 9.23a1.12 1.12 0 1 1-.65-2.15c4.27-1.3 11.38-1.05 15.85 1.6a1.12 1.12 0 0 1-1.15 1.94Z" />
        </svg>
      </a>
    </nav>
  );
}
