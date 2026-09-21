'use client';

import Image from 'next/image';
import { MusicOverview, type MusicFocus } from './music_overview';
import { MusicPlaylist } from './music_playlist';
import { useAlbumScroll } from './use_album_scroll';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowUpRight, Check, ChevronLeft, ChevronRight, Disc3, MapPin, Pause, Play, Search, X } from 'lucide-react';
import { artist_connection, google_music_embed_url, google_music_url, music_places, music_tracks, preview_time, search_music, track_places, type MusicPlace, type MusicTrack } from '@/lib/nyc_music_map';

function AlbumCover({ track, small = false }: { track: MusicTrack; small?: boolean }) {
  const [failed, set_failed] = useState(false);
  if (failed) return <span className="sound-cover-fallback"><Disc3 aria-hidden="true" /><span>{small ? track.artist : 'Album artwork unavailable'}</span></span>;
  return <Image src={track.artwork_url} alt={small ? '' : `${track.album} album cover`} width={small ? 100 : 240} height={small ? 100 : 240} unoptimized loading={small ? 'lazy' : 'eager'} onError={() => set_failed(true)} />;
}

function GoogleMusicMap({ place, overview, fit_request, focus_request, on_select, google_maps_key }: { google_maps_key: string; place: MusicPlace; overview: boolean; fit_request: number; focus_request: MusicFocus | null; on_select: (track: MusicTrack, place_id: string) => void }) {
  const embed_url = google_music_embed_url(place, google_maps_key);
  return <section className="sound-map-panel" aria-label={overview ? 'Map of all songs' : `Map of ${place.name}`}>
    <div className="sound-map-heading"><span><MapPin size={16} aria-hidden="true" />{overview ? 'All song locations' : place.name}</span><span>{overview ? `${music_places.length} places · ${music_tracks.length} songs` : 'Selected place'}</span></div>
    <div className="sound-map-frame">
      {overview ? <MusicOverview selected_place_id={place.id} fit_request={fit_request} focus_request={focus_request} on_select={on_select} /> : embed_url ? <iframe key={place.id} title={`Google Maps: ${place.name}`} src={embed_url} referrerPolicy="strict-origin-when-cross-origin" allowFullScreen /> : <p className="sound-location-note">The map is unavailable. Use the Google Maps link below.</p>}

    </div>
    <div className="sound-map-footer"><div><span className="sound-label">{place.precision}</span><p>{place.name} · {place.area}</p></div><a href={google_music_url(place)} target="_blank" rel="noopener noreferrer">Open in Google Maps <ArrowUpRight size={17} aria-hidden="true" /></a></div>
    <p className="sound-location-note">{place.note}</p>
  </section>;
}

export function NycMusicMap({ google_maps_key }: { google_maps_key: string }) {
  const [query, set_query] = useState('');
  const [overview, set_overview] = useState(false);
  const [fit_request, set_fit_request] = useState(0);
  const [focus_request, set_focus_request] = useState<MusicFocus | null>(null);
  const [track_id, set_track_id] = useState<string | null>(music_tracks[0].id);
  const [place_id, set_place_id] = useState(music_tracks[0].place_ids[0]);
  const [playing, set_playing] = useState(false);
  const [loading, set_loading] = useState(false);
  const [elapsed, set_elapsed] = useState(0);
  const [duration, set_duration] = useState(0);
  const [message, set_message] = useState('');
  const audio = useRef<HTMLAudioElement>(null);
  const play_request = useRef({ value: 0 });
  const pending_play = useRef(false);
  const shelf = useRef<HTMLDivElement>(null);
  const results = useMemo(() => search_music(query), [query]);
  const album_scroll = useAlbumScroll(shelf, results.map((item) => item.id).join(','));
  const track = music_tracks.find((item) => item.id === track_id);
  const places = track ? track_places(track) : [];
  const place = places.find((item) => item.id === place_id) ?? places[0];

  function stop_preview() {
    ++play_request.current.value;
    pending_play.current = false;
    const element = audio.current;
    if (element) {
      element.pause();
      element.removeAttribute('src');
      delete element.dataset.track;
      element.load();
    }
    set_playing(false);
    set_loading(false);
    set_elapsed(0);
    set_duration(0);
    set_message('');
  }

  function select_track(next_track: MusicTrack | undefined) {
    if (next_track?.id === track_id) return;
    stop_preview();
    set_track_id(next_track?.id ?? null);
    set_place_id(next_track?.place_ids[0] ?? '');
  }

  function select_map_track(next_track: MusicTrack, next_place_id: string) {
    album_scroll.defer();
    set_query('');
    select_track(next_track);
    set_place_id(next_place_id);
    set_focus_request({ place_id: next_place_id });
    requestAnimationFrame(() => {
      shelf.current?.querySelector<HTMLElement>(`[data-track-id="${next_track.id}"]`)?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'instant' });
      album_scroll.defer();
    });
  }

  function show_all_places() {
    change_query('');
    set_focus_request(null);
    set_overview(true);
    set_fit_request((value) => value + 1);
  }

  function change_query(next_query: string) {
    set_query(next_query);
    const next_results = search_music(next_query);
    if (overview && !next_results.length) { stop_preview(); return; }
    if (!next_results.some((item) => item.id === track_id)) select_track(next_results[0]);
  }

  async function toggle_preview() {
    const element = audio.current;
    if (!element || !track) return;
    if (pending_play.current || !element.paused) {
      ++play_request.current.value;
      pending_play.current = false;
      element.pause();
      set_loading(false);
      set_playing(false);
      return;
    }
    const ticket = ++play_request.current.value;
    pending_play.current = true;
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
      if (ticket === play_request.current.value) set_playing(true);
    } catch (error) {
      if (ticket === play_request.current.value) {
        set_playing(false);
        set_message(error instanceof DOMException && error.name === 'NotAllowedError' ? 'Press play again to allow the preview.' : 'This preview is unavailable. You can still open the song on Apple Music.');
      }
    } finally {
      if (ticket === play_request.current.value) {
        pending_play.current = false;
        set_loading(false);
      }
    }
  }

  useEffect(() => {
    const element = audio.current;
    const request_state = play_request.current;
    return () => {
      ++request_state.value;
      element?.pause();
      element?.removeAttribute('src');
      element?.load();
    };
  }, []);

  function move_shelf(direction: number) {
    album_scroll.defer();
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    shelf.current?.scrollBy({ left: direction * (shelf.current.clientWidth * .75), behavior: reduced ? 'instant' : 'smooth' });
  }

  return <div className="sound-explorer">
    <MusicPlaylist />
    <div className="sound-catalog-heading"><div><Disc3 size={18} aria-hidden="true" /><span>{music_tracks.length} songs · {music_places.length} places</span></div><label className="sound-search"><Search size={17} aria-hidden="true" /><input type="search" value={query} onChange={(event) => change_query(event.target.value)} placeholder="Song, artist or place" aria-label="Search songs, artists or places" />{query && <button aria-label="Clear search" onClick={() => change_query('')}><X size={16} aria-hidden="true" /></button>}</label><div className="sound-shelf-controls"><button disabled={album_scroll.reduced} aria-label={album_scroll.reduced ? 'Album scrolling off: reduced motion' : album_scroll.scrolling ? 'Pause album scrolling' : 'Resume album scrolling'} title={album_scroll.reduced ? 'Reduced motion is enabled' : album_scroll.scrolling ? 'Pause album scrolling' : 'Resume album scrolling'} onClick={album_scroll.toggle}>{album_scroll.scrolling ? <Pause size={17} aria-hidden="true" /> : <Play size={17} aria-hidden="true" />}</button><button aria-label="Previous songs" onClick={() => move_shelf(-1)}><ChevronLeft size={19} aria-hidden="true" /></button><button aria-label="More songs" onClick={() => move_shelf(1)}><ChevronRight size={19} aria-hidden="true" /></button></div></div>
    <output className="sound-search-status">{query ? `${results.length} matching ${results.length === 1 ? 'song' : 'songs'}` : 'Choose a record to find its places.'}</output>
    <div className={`sound-shelf${album_scroll.scrolling ? ' is-scrolling' : ''}`} ref={shelf} aria-label="Song collection">
      {results.map((item) => <button key={item.id} data-track-id={item.id} className="sound-album" aria-pressed={track_id === item.id} aria-label={`Select ${item.title} by ${item.artist}`} onClick={() => { const target_place = item.id === track_id ? place_id : item.place_ids[0]; select_track(item); set_focus_request({ place_id: target_place }); }}><span className="sound-album-art"><AlbumCover track={item} small /><span className="sound-album-number">{track_id === item.id ? <Check size={14} aria-hidden="true" /> : String(music_tracks.indexOf(item) + 1).padStart(2, '0')}</span></span><strong>{item.title}</strong><span>{item.artist}</span><span className="sound-album-place">{track_places(item)[0].name}{artist_connection(item, item.place_ids[0]) && ' · Artist connection'}</span></button>)}
    </div>
    <fieldset className="sound-map-controls" aria-label="Map view"><button aria-pressed={overview} onClick={show_all_places}><MapPin size={16} aria-hidden="true" />Show all places</button><button aria-pressed={!overview} onClick={() => set_overview(false)}>Selected place</button>{overview && <span>All songs, including those outside your search. Zoom in to separate nearby places.</span>}</fieldset>
    {track && place ? <>
      <div className="sound-place-picker"><span className="sound-label">Related places</span><div>{places.map((item) => <button key={item.id} aria-pressed={place.id === item.id} onClick={() => { set_place_id(item.id); set_focus_request({ place_id: item.id }); }}><MapPin size={15} aria-hidden="true" />{item.name}</button>)}</div></div>
      <div className="sound-workspace">
        <GoogleMusicMap place={place} overview={overview} fit_request={fit_request} focus_request={focus_request} on_select={select_map_track} google_maps_key={google_maps_key} />
        <article className={`sound-record${playing ? ' is-playing' : ''}`} aria-label="Selected song">
          <div className="sound-record-top" key={`cover-${track.id}`}><a className="sound-selected-cover" href={track.apple_music_url} target="_blank" rel="noopener noreferrer" aria-label={`Open ${track.album} on Apple Music`}><AlbumCover key={track.id} track={track} /></a><div><p className="sound-label">{track.year ?? 'Year unverified'} · {track.genre}</p><h2>{track.title}</h2><p className="sound-artist">{track.artist}</p><p className="sound-album-name">{track.album}</p></div></div>
          <div className="sound-player"><button className="sound-play" onClick={() => void toggle_preview()} aria-label={loading ? 'Cancel loading preview' : playing ? 'Pause preview' : `Play preview of ${track.title}`}><span>{loading || playing ? <Pause size={20} aria-hidden="true" /> : <Play size={20} aria-hidden="true" />}</span>{loading ? 'Loading preview…' : playing ? 'Pause preview' : 'Play preview'}</button><Disc3 className="sound-playback-disc" size={30} aria-hidden="true" /><div className="sound-progress"><progress value={elapsed} max={duration || 1} aria-label="Preview playback progress" /><span>{preview_time(elapsed)} <span>/ {duration ? preview_time(duration) : 'preview'}</span></span></div></div>
          <output className="sound-preview-message">{message || 'Song preview provided courtesy of iTunes.'}</output>
          <div className="sound-store-links"><a href={track.apple_music_url} target="_blank" rel="noopener noreferrer">Listen on Apple Music <ArrowUpRight size={15} aria-hidden="true" /></a><a href={track.apple_music_url} target="_blank" rel="noopener noreferrer" aria-label={`Download ${track.title} on iTunes`}><Image src="/images/music-map/itunes-badge.svg" alt="Download on iTunes" width={110} height={40} unoptimized /></a></div>
          {artist_connection(track, place.id) && <div className="sound-story sound-connection"><p className="sound-label">Artist connection · {artist_connection(track, place.id)!.kind}</p><h3>{place.name}</h3><p>{artist_connection(track, place.id)!.note}</p><a className="sound-source" href={artist_connection(track, place.id)!.source_url} target="_blank" rel="noopener noreferrer">{artist_connection(track, place.id)!.source_label}<ArrowUpRight size={14} aria-hidden="true" /></a></div>}
          <div className="sound-story" key={track.id}><p className="sound-label">{artist_connection(track, place.id) ? 'About the song' : track.excerpt ? 'In the lyrics' : 'In the title'}</p>{track.excerpt ? <blockquote>“{track.excerpt}”</blockquote> : <h3>{artist_connection(track, place.id) ? track.title : place.name}</h3>}<p>{track.note}</p><a className="sound-source" href={track.source_url} target="_blank" rel="noopener noreferrer">{track.source_label}<ArrowUpRight size={14} aria-hidden="true" /></a>{track.excerpt && <span className="sound-excerpt-note">Short excerpt. Full lyrics at the source.</span>}</div>
        </article>
      </div>
    </> : <div className="sound-empty"><Disc3 size={32} aria-hidden="true" /><h2>No songs found.</h2><p>Try a different song, artist or New York place.</p><button onClick={() => change_query('')}>Show all songs</button></div>}
    {/* Apple supplies audio previews without synchronized lyric transcripts. */}
    {/* oxlint-disable-next-line jsx-a11y/media-has-caption */}
    <audio ref={audio} preload="none" aria-label="Song preview" onPlaying={() => { if (audio.current?.dataset.track === track_id) { set_playing(true); set_loading(false); } }} onPause={() => set_playing(false)} onTimeUpdate={() => set_elapsed(audio.current?.currentTime ?? 0)} onDurationChange={() => { const value = audio.current?.duration; set_duration(value && Number.isFinite(value) ? value : 0); }} onEnded={() => { pending_play.current = false; set_playing(false); set_loading(false); }} onError={() => { if (audio.current?.hasAttribute('src')) { ++play_request.current.value; pending_play.current = false; set_loading(false); set_playing(false); set_message('This preview is unavailable. You can still open the song on Apple Music.'); } }} />
  </div>;
}
