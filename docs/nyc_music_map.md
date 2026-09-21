# NYC Music Map

Route: `/portfolio/nyc-music-map`. The 118-recording, 66-place catalog is separate from the ten homepage records. The original 59 recordings remain intact and retain their relative order. The concurrent 103-recording expansion is retained. Eighteen researched neighborhood/street/landmark selections lead the shelf: three overlap that expansion and are deduplicated by Apple track ID, so this change adds 15 unique recordings and 17 unique places. The specific places include Bushwick, Bed-Stuy, Queensbridge, Corona, Hollis, Utopia Parkway, the Lower East Side, Canal Street and Mermaid Avenue. Album captions expose the first mapped place.

## Recording and geographic provenance

Every recording retains its exact Apple track ID, selected album, artwork, streamed preview, full-recording link and metadata lookup. `metadata_release_date` preserves Apple's supplied value. The displayed year normally follows that digital release, with documented original-release exceptions: Washington Square (1963), Funkin' for Jamaica (1980), Brooklyn Zoo (1995), and Utopia Parkway (1999). Apple's Utopia Parkway result incorrectly reports 1990; the linked street/album history substantiates 1999. Availability checks are not proof of playback in every browser or region.

Artist sources substantiate Billy Joel, Paul Simon, Bob Dylan, Bill Withers and Bruce Springsteen lyric relations. Smithsonian material supplies the Sugar Hill relation for Take the A Train. The new excerpts are bounded to ten words each: Corona from Paul Simon, Washington Heights/Harlem from Dylan, and Harlem from Springsteen. Dylan's official lyrics also identify Rockefeller Plaza and the Staten Island ferry. Titles without verified lyric excerpts remain labeled title associations. Instrumentals do not receive invented lyrics. Original commentary distinguishes a title, a lyric location and background history.

The Klezmatics' Mermaid's Avenue links its Coney Island street background; Stompin' at the Savoy maps the former Harlem ballroom, not a current venue. Savoy venue reference: https://en.wikipedia.org/wiki/Savoy_Ballroom. Tom's Diner uses Suzanne Vega's a cappella recording and the Broadway/112th Street restaurant background. Christmas in Hollis links the Queens song background; Bed-Stuy is Burning links the artist's release. No new recording is mapped only at city scale.

Neighborhoods, boroughs, streets, rivers and routes use approximate editorial coordinates and visible precision labels. OpenStreetMap coordinate links make those points inspectable, not independently certified lyric addresses. The 82nd Street point does not establish a bus stop or which side of Manhattan the title intends; Harlem is separately supported by the official lyrics. The ferry point represents a route, not a terminal. Birdland remains the original Broadway/52nd Street site. Bleecker Street and its MacDougal intersection intentionally overlap and can be expanded. No private home is offered as a destination and no geocoding service is called.

## Maps and selection

Show all places clears search and fits all 66 places; later shelf filtering leaves the full map intact. Nearby markers cluster by unique place count. A popup lists every related recording and artist, and choosing one retains that clicked place. Clusters support pointer, Enter and Space; marker popups support keyboard selection and Escape focus return. Tile failure exposes retry while the catalog and external Google links remain usable.

Explicit song/place selection moves the overview to that location in 0.5 seconds. Search alone never moves it. Show all places cancels a pending movement and restores the full bounds. Reduced motion uses an immediate view change and stops an active flight when the preference changes. Cluster icon transitions are disabled. OpenStreetMap attribution remains visible and map wheel zoom is disabled so normal page scrolling works.

Google Maps embeds the selected place through the shared free Maps Embed API helper and opens the same query through keyless Maps URLs. Literary, Music and Film Map share one runtime-configured browser key. Missing configuration omits the iframe while preserving the external link and location description. See [the Google Maps cost policy](google_maps.md). The overview uses existing Leaflet dependencies and public OpenStreetMap tiles; this change adds no Google JavaScript API, geocoding API or metered service. The external link and readable place description remain if the cross-origin embed fails. Iframe load events do not certify that Google's map rendered.

## Album motion and playback

The shelf moves at 36 pixels per second, three times its previous speed, and reverses at either end. It resumes two seconds after the last manual wheel, pointer, trailing scroll or arrow interaction. Held pointers suspend it; releasing or cancelling starts the idle delay. Blur releases a lost pointer. A manual interaction exempts that pointer visit from the hover pause so the shelf resumes while the mouse remains over it; a later passive hover pauses normally. Pointer-origin focus does not become a permanent keyboard pause. Keyboard focus, hidden tabs and reduced motion retain their protections. Only the explicit Pause control remains sticky across interactions and search. Native scrolling is never cancelled, and no cards are duplicated.

Selected covers lift slightly; song details enter over 200 milliseconds; buttons give a short pressed response. These effects do not remount the audio element or animate playback progress updates. CSS removes the new transitions and entry animations for reduced motion.

Playback remains user-initiated. Selecting a different recording stops and clears the prior stream; selecting another place within the same recording preserves it. One audio element and an asynchronous request counter handle cancellation, failure, ended and unmount. Audio streams directly with `preload="none"`; no audio files are copied or cached by the application. Apple attribution and a store badge remain beside the controls.

## Verification

Accepted scope: MUSIC-RESUME-04, MUSIC-NEIGHBORHOODS-05 and MUSIC-FEEDBACK-06, following the prior overview/catalog work. Source checks cover unique recording IDs, valid place relations, bounded excerpts, coordinate ranges and homepage collection counts. Browser regressions cover native horizontal wheel resumption, shelf arrows, explicit Pause, hover/keyboard focus, reduced motion, synthetic held touch plus trailing scroll, end reversal, neighborhood search, overview focus/reset, cluster keyboard access, tile failure and audio lifecycle. Synthetic pointer coverage is not physical-device touch testing. Exact CI and review results belong in the PR receipt.

Apple metadata reference: https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/iTuneSearchAPI/index.html

Google Maps URL reference: https://developers.google.com/maps/documentation/urls/get-started

Apple badge source: https://tools.applemediaservices.com/api/badges/get-it-on-itunes/badge/en-us?size=250x83

Recording-specific title, lyric, background and metadata sources are retained in `content/nyc_music_map.json`.


## Integration with the full song list

The three shared recordings retain their existing IDs and Apple metadata: QueensBridge Politics, Coney Island Steeplechase and Stompin' at the Savoy. Coney Island Steeplechase retains its Coney Island relation and adds the more specific former park site as its first place. Existing shared place objects are preserved. All 103 earlier recordings remain available; the full links, copy and CSV export now contain all 118. New catalog bounds and exports are covered by the combined browser suite.

## Earlier expansion and Apple Music handoff

The September 20, 2026 owner request expands the catalog to 103 recordings and 49 places, retaining the previous 59 entries and the ten featured homepage records. The 44 additions were resolved against Apple's public iTunes catalog, including exact track IDs, selected digital release dates, covers, preview URLs and full recording links. Thirty-six additions have street, neighborhood, venue or landmark references. New places include Avenue A, Flatbush, Queensbridge, Lenox Avenue, Central Park North, Grand Central and the Upper West Side. Harlem River Drive is its own road marker, separate from the river. Representative coordinates are approximate editorial locators, not geocoded lyric addresses. The Savoy marker represents a former venue. Titles establish the relation unless an explicit additional source is supplied; no new lyric excerpts are invented. Different artists' interpretations are identified as such in the notes, never counted as different geographic destinations. The year follows the selected digital release, including reissues.

The collection-level `Songs on Apple Music` button opens a complete, accessible list of real full-song links. Search does not silently narrow the exported list. `Export song list` downloads UTF-8 CSV with title, artist, album, place names and the Apple URL; copy produces artist/title text with a selectable fallback when clipboard access fails. Quotes, Unicode and spreadsheet formula prefixes are handled. The API returns a CSV attachment and does not proxy or save audio.

This is a song-list export, not a created Apple Music cloud playlist. Apple MusicKit requires developer credentials and listener authorization to create library playlists. This Site has no such configuration. A true collection-level Apple playlist link remains pending an actual published playlist; the unrelated Favorite Songs link must not be substituted. Apple's Mac XML import only retains songs already in the listener's library, so the CSV is not advertised as native Apple import.

Official capability references:
- https://developer.apple.com/musickit/
- https://support.apple.com/guide/music/save-a-copy-of-your-playlists-mus27cd5060f/mac

Accepted review scope: MUSIC-SCALE-01, MUSIC-PLAYLIST-01, PROJECT-ORDER-01. Projects now run Mortgage Mind Map, music, film, literary, with the same music/film/book sequence as the recommendations. The mortgage URL and concept IDs remain unchanged.

All 88 newly added artwork and preview endpoints returned HTTP 200 during the September 20 expansion check. This verifies availability, not full playback across every device or region.

Independent provenance review removed Grover Washington Jr.’s East River Drive because reporting identifies a Philadelphia road, and removed Stanley Clarke’s same-title recording because no independent NYC basis was established. The unused road marker was removed. Apple returned impossible or conflicting dates for Ethel Waters’s Harlem On My Mind (1926) and Cannonball Adderley’s Grand Central with John Coltrane (1937); their public year is null and reads “Year unverified,” while the raw API release date is retained for traceability. No precise replacement recording date is asserted.
