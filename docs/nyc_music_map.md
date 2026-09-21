# NYC Music Map

Route: `/portfolio/nyc-music-map`. The 77-recording, 55-place catalog is separate from the ten homepage records. The original 59 recordings remain intact and retain their relative order; 18 additions lead with specific neighborhoods, streets and landmarks. Twenty new places include Bushwick, Bed-Stuy, Queensbridge, Corona, Hollis, Utopia Parkway, the Lower East Side, Canal Street and Mermaid Avenue. Album captions expose the first mapped place.

## Recording and geographic provenance

Every recording retains its exact Apple track ID, selected album, artwork, streamed preview, full-recording link and metadata lookup. `metadata_release_date` preserves Apple's supplied value. The displayed year normally follows that digital release, with documented original-release exceptions: Washington Square (1963), Funkin' for Jamaica (1980), Brooklyn Zoo (1995), and Utopia Parkway (1999). Apple's Utopia Parkway result incorrectly reports 1990; the linked street/album history substantiates 1999. Availability checks are not proof of playback in every browser or region.

Artist sources substantiate Billy Joel, Paul Simon, Bob Dylan, Bill Withers and Bruce Springsteen lyric relations. Smithsonian material supplies the Sugar Hill relation for Take the A Train. The new excerpts are bounded to ten words each: Corona from Paul Simon, Washington Heights/Harlem from Dylan, and Harlem from Springsteen. Dylan's official lyrics also identify Rockefeller Plaza and the Staten Island ferry. Titles without verified lyric excerpts remain labeled title associations. Instrumentals do not receive invented lyrics. Original commentary distinguishes a title, a lyric location and background history.

The Klezmatics' Mermaid's Avenue links its Coney Island street background; Stompin' at the Savoy maps the former Harlem ballroom, not a current venue. Savoy venue reference: https://en.wikipedia.org/wiki/Savoy_Ballroom. Tom's Diner uses Suzanne Vega's a cappella recording and the Broadway/112th Street restaurant background. Christmas in Hollis links the Queens song background; Bed-Stuy is Burning links the artist's release. No new recording is mapped only at city scale.

Neighborhoods, boroughs, streets, rivers and routes use approximate editorial coordinates and visible precision labels. OpenStreetMap coordinate links make those points inspectable, not independently certified lyric addresses. The 82nd Street point does not establish a bus stop or which side of Manhattan the title intends; Harlem is separately supported by the official lyrics. The ferry point represents a route, not a terminal. Birdland remains the original Broadway/52nd Street site. Bleecker Street and its MacDougal intersection intentionally overlap and can be expanded. No private home is offered as a destination and no geocoding service is called.

## Maps and selection

Show all places clears search and fits all 55 places; later shelf filtering leaves the full map intact. Nearby markers cluster by unique place count. A popup lists every related recording and artist, and choosing one retains that clicked place. Clusters support pointer, Enter and Space; marker popups support keyboard selection and Escape focus return. Tile failure exposes retry while the catalog and external Google links remain usable.

Explicit song/place selection moves the overview to that location in 0.5 seconds. Search alone never moves it. Show all places cancels a pending movement and restores the full bounds. Reduced motion uses an immediate view change and stops an active flight when the preference changes. Cluster icon transitions are disabled. OpenStreetMap attribution remains visible and map wheel zoom is disabled so normal page scrolling works.

Google Maps shows the selected place with the same query as its external link. The overview uses existing Leaflet dependencies and public OpenStreetMap tiles; this change adds no Google JavaScript API, geocoding API or metered service. The external link and readable place description remain if the cross-origin embed fails. Iframe load events do not certify that Google's map rendered.

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
