# NYC Music Map

Route: `/portfolio/nyc-music-map`. Separate catalog from the ten homepage records.

The catalog contains 12 recordings and 13 places. Each recording retains the exact Apple track ID, album, artwork URL, streamed preview URL, full-song link and metadata lookup source. The selected recordings and all artwork/preview endpoints returned HTTP 200 on September 20, 2026. Album metadata reflects the selected digital release. Audio is streamed directly with `preload="none"`; audio files are never copied into the repository or cached by this application.

Artist sources substantiate the lyric relations for Billy Joel, Paul Simon and Bob Dylan. Other entries use explicit titles, linked to artist or recording pages. A title association is not presented as a verified lyric excerpt. Short excerpts are limited to ten words per song. Song and place descriptions are original commentary. Neighborhoods, boroughs and representative street points are labeled; no private residence is presented as a song destination.

Google Maps embeds the selected place and opens the same query through the official Maps URL syntax. This no-key version shows one place at a time. It does not claim simultaneous custom markers, Places data access, or a configured Google Maps JavaScript API. A Google API project and appropriately restricted key would be needed to add that distinct mode. The external map link and readable location description remain available if the third-party iframe cannot load. Cross-origin frame content cannot be reliably inspected by the application, so it does not declare a successful map load based on the iframe load event.

The preview is user-initiated. Selecting another record stops and clears the previous stream; choosing another place in the same song preserves playback. A single audio element and request counter guard asynchronous playback. Pause/cancel, ended, failure and route-unmount are handled. Reduced motion removes playback-icon rotation and transitions. Apple attribution and a store badge sit beside the preview and full recording links.

Apple badge source: https://tools.applemediaservices.com/api/badges/get-it-on-itunes/badge/en-us?size=250x83

References:

- https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/iTuneSearchAPI/index.html
- https://developers.google.com/maps/documentation/urls/get-started
- Recording, title and lyric sources are retained in `content/nyc_music_map.json`.

Accepted design review: MUSIC-01 (provenance and geographic scope), MUSIC-02 (honest selected-place Google map), MUSIC-03 (real, race-safe, user-initiated previews). This is a new requested project, not a redesign of the existing Film Map or record player.
