# NYC Music Map

Route: `/portfolio/nyc-music-map`. Separate catalog from the ten homepage records.

The catalog contains 59 recordings and 35 places across all five boroughs. The original twelve recordings remain unchanged. Each recording retains the exact Apple track ID, album, artwork URL, streamed preview URL, full-song link and metadata lookup source. The original media endpoints and all 48 artwork/preview endpoints added in this expansion returned HTTP 200 on September 20, 2026. Endpoint checks verify availability and media type, not successful browser playback of every recording. Album metadata reflects the selected digital release. Each added track preserves `metadata_release_date`; the displayed year normally follows it. Three documented original-release dates are used instead: Washington Square (1963), Funkin’ for Jamaica (1980), and Brooklyn Zoo (1995). Their linked song references substantiate these dates. Audio is streamed directly with `preload="none"`; audio files are never copied into the repository or cached by this application.

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


## Full collection overview and album movement

September 20 expansion adds 23 recordings, retaining the original 36 intact, and four places: Chelsea, Harlem River, Mulberry Street and a city-scale New York entry. New York title references stay city-wide rather than receiving invented landmark associations. Chelsea Morning uses Joni Mitchell’s official song page; Chelsea Girls links the song/hotel background; Harlem River links Kevin Morby’s album page; Big Man on Mulberry Street uses Billy Joel’s official lyrics. The remaining additions retain Apple title/recording pages and exact API metadata including release date. The displayed year is the selected Apple release’s year, not a new claim about the first-ever performance.

Each place now has a hand-selected approximate overview coordinate and an OpenStreetMap coordinate reference. These links make the point inspectable; they are not evidence of an address in a lyric. Street, neighborhood, borough, city and river positions remain representative and retain their precision/note labels. Bleecker Street and its separately cataloged MacDougal intersection intentionally share coordinates and can be separated by the map’s overlap expansion. No geocoding service is called.

Show all places clears the search and fits all 35 places. This overview continues to show the entire catalog while the record shelf is searched. Each place popup lists every related recording, including artist, and selecting one preserves that clicked place. Selecting a different recording stops the previous audio; choosing a different place in the same recording does not. The selected-place Google view and outbound map link remain available. Nearby points cluster by unique place count; a cluster expands by pointer, Enter or Space. Individual markers and their song buttons support keyboard interaction, including Escape to return focus. Tile failures display an honest fallback while the recording collection and Google links stay usable. The overview uses the existing Leaflet dependencies and OpenStreetMap tiles, with visible attribution and no wheel-zoom interception.

Album cards move at 12 pixels per second and reverse at either end. There are no duplicate cards or automatic song selection/playback. Pause persists until Resume; pointer interaction, wheel scrolling and shelf arrows also pause until Resume. Hover/focus suspend movement temporarily; hidden tabs do not accumulate a jump. Reduced motion disables automatic movement, including preference changes. Native manual scrolling and arrow controls remain available. The React hook retains framework-required useAlbumScroll naming; data and ordinary helper names use snake_case.

Accepted scope: MUSIC-OVERVIEW-01, MUSIC-MOTION-02, MUSIC-CATALOG-03. Source checks cover catalog identities, ≤10-word lyric excerpts, place relations, coordinate bounds and preservation of the ten homepage records. Browser/CI evidence is recorded with the PR; do not infer playback or live Google authorization from metadata/HTTP checks.

The 46 new artwork/preview URLs returned HTTP 200 with media content types during this change. This confirms endpoint availability, not full playback in every browser or region. Overview coordinates are approximate editorial locators, not Google-geocoded or individually certified lyric coordinates.

## Hundred-song catalog and Apple Music handoff

The September 20, 2026 owner request expands the catalog to 105 recordings and 50 places, retaining the previous 59 entries and the ten featured homepage records. The 46 additions were resolved against Apple's public iTunes catalog, including exact track IDs, selected digital release dates, covers, preview URLs and full recording links. Thirty-eight additions have street, neighborhood, venue or landmark references. New places include Avenue A, Flatbush, Queensbridge, Lenox Avenue, Central Park North, Grand Central and the Upper West Side. Harlem River Drive is its own road marker, separate from the river. Representative coordinates are approximate editorial locators, not geocoded lyric addresses. The Savoy marker represents a former venue. Titles establish the relation unless an explicit additional source is supplied; no new lyric excerpts are invented. Different artists' interpretations are identified as such in the notes, never counted as different geographic destinations. The year follows the selected digital release, including reissues.

The collection-level `Songs on Apple Music` button opens a complete, accessible list of real full-song links. Search does not silently narrow the exported list. `Export song list` downloads UTF-8 CSV with title, artist, album, place names and the Apple URL; copy produces artist/title text with a selectable fallback when clipboard access fails. Quotes, Unicode and spreadsheet formula prefixes are handled. The API returns a CSV attachment and does not proxy or save audio.

This is a song-list export, not a created Apple Music cloud playlist. Apple MusicKit requires developer credentials and listener authorization to create library playlists. This Site has no such configuration. A true collection-level Apple playlist link remains pending an actual published playlist; the unrelated Favorite Songs link must not be substituted. Apple's Mac XML import only retains songs already in the listener's library, so the CSV is not advertised as native Apple import.

Official capability references:
- https://developer.apple.com/musickit/
- https://support.apple.com/guide/music/save-a-copy-of-your-playlists-mus27cd5060f/mac

Accepted review scope: MUSIC-SCALE-01, MUSIC-PLAYLIST-01, PROJECT-ORDER-01. Projects now run Mortgage Mind Map, music, film, literary, with the same music/film/book sequence as the recommendations. The mortgage URL and concept IDs remain unchanged.

All 92 newly added artwork and preview endpoints returned HTTP 200 during the September 20 expansion check. This verifies availability, not full playback across every device or region.
