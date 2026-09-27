# Recent NYC screen and music additions

Accepted scope, September 27, 2026: expand the Atlas with an emphasis on films, television series and songs from 2020 onward. Keep the existing map-first interface and shared compact cards.

- Add verified New York filming locations with scene-matched frames or explicitly credited production stills. Reuse existing physical-place IDs, and distinguish fictional settings from filming venues.
- Add recent songs with Apple recording metadata, artwork and working preview URLs. Distinguish title/lyric geography, music-video filming, live performance and live recording; do not present a studio preview as a live recording.
- Verify screen credits and completed/ongoing series dates against current sources. Venue-level pins must not imply exact camera positions or public interior access.
- Preserve the current OpenFreeMap/MapLibre implementation, free map constraints, existing collections and ten featured homepage items per medium. Do not restore removed places.
- Record source URLs, image provenance, metadata date and asset hashes. Keep copy brief and retain source access through existing cards.

Validation: focused catalog/search/media-provenance checks locally; one independent exact-head review and the complete quality/build/browser CI gate; native deployment success and production HTTP/data/image checks.

The expanded catalog initially exceeded the unchanged 160 kB search-index budget. Remove duplicate display text from the serialized search field and combine those existing fields during search; preserve matching and ordering with the existing exhaustive catalog comparison.

Added: four films, three series, thirteen scene associations and eleven songs. Parent inspected all thirteen images; all twenty-two new Apple artwork/preview URLs returned usable media over HTTP on September 27, 2026. This is a media delivery check, not an assertion of audible browser playback.
