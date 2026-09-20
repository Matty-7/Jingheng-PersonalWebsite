# NYC Music Map

Route: `/portfolio/nyc-music-map`. Separate catalog from the ten homepage records.

The catalog contains 36 recordings and 31 places across all five boroughs. The original twelve recordings remain unchanged. Each recording retains the exact Apple track ID, album, artwork URL, streamed preview URL, full-song link and metadata lookup source. The original media endpoints and all 48 artwork/preview endpoints added in this expansion returned HTTP 200 on September 20, 2026. Endpoint checks verify availability and media type, not successful browser playback of every recording. Album metadata reflects the selected digital release. Each added track preserves `metadata_release_date`; the displayed year normally follows it. Three documented original-release dates are used instead: Washington Square (1963), Funkin’ for Jamaica (1980), and Brooklyn Zoo (1995). Their linked song references substantiate these dates. Audio is streamed directly with `preload="none"`; audio files are never copied into the repository or cached by this application.

Artist sources substantiate the lyric relations for Billy Joel, Paul Simon, Bob Dylan and Bill Withers; the Smithsonian supplies the Sugar Hill lyric and vocal-recording context for Take the A Train. Other entries use explicit titles, linked to artist or recording pages. A title association is not presented as a verified lyric excerpt. Short excerpts are limited to ten words per song. Song and place descriptions are original commentary. Neighborhoods, boroughs and representative street points are labeled; no private residence is presented as a song destination.

Google Maps embeds the selected place and opens the same query through the official Maps URL syntax. This no-key version shows one place at a time. It does not claim simultaneous custom markers, Places data access, or a configured Google Maps JavaScript API. A Google API project and appropriately restricted key would be needed to add that distinct mode. The external map link and readable location description remain available if the third-party iframe cannot load. Cross-origin frame content cannot be reliably inspected by the application, so it does not declare a successful map load based on the iframe load event.

The preview is user-initiated. Selecting another record stops and clears the previous stream; choosing another place in the same song preserves playback. A single audio element and request counter guard asynchronous playback. Pause/cancel, ended, failure and route-unmount are handled. Reduced motion removes playback-icon rotation and transitions. Apple attribution and a store badge sit beside the preview and full recording links.

Apple badge source: https://tools.applemediaservices.com/api/badges/get-it-on-itunes/badge/en-us?size=250x83

References:

- https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/iTuneSearchAPI/index.html
- https://developers.google.com/maps/documentation/urls/get-started
- Recording, title and lyric sources are retained in `content/nyc_music_map.json`.

Accepted design review: MUSIC-01 (provenance and geographic scope), MUSIC-02 (honest selected-place Google map), MUSIC-03 (real, race-safe, user-initiated previews). This is a new requested project, not a redesign of the existing Film Map or record player.


The catalog expansion follows MUSIC-CATALOG-01 (traceable New York geography), MUSIC-CATALOG-02 (recording and media identity), and MUSIC-CATALOG-03 (shared places and collection scale). The homepage count now comes from the catalog. Shared places carry geographic notes while each recording retains its own interpretation. Neighborhoods and boroughs are not substituted with arbitrary venues; South Bronx is labeled an area. Birdland is the original Broadway/52nd Street site, identified by the club’s own history, rather than its present West 44th Street location. Jamaica refers to Queens, with a dedicated song reference. Instrumentals use title associations without invented lyrics. Ambiguous songs whose New York connection could not be established were omitted.

Expansion verification includes unique Apple IDs, valid and non-duplicated place relations, no unused places, bounded excerpts, and matching Google Maps embed/external queries. Browser regression coverage searches the new Queens, Bronx and Staten Island entries, selects the last song by keyboard, checks the Jazz search and horizontal overflow, and confirms that selection alone does not start audio. The selected South Bronx recording is explicitly the live SOB’s version; its performance venue is not confused with the song’s mapped destination.
