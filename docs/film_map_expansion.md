# NYC Film Map expansion, September 21, 2026

This pass deepens the existing catalog and aligns its presentation with Music Map. It adds no Google lookup service: the existing OSM multi-place overview, single selected-place no-charge Google Embed and keyless destination links remain the only map integrations.

## Content verification

All 19 original film source inventories were inspected, together with a new Broadway Danny Rose inventory and independent Annie Hall location studies. Numbered addresses use exact street, house number and borough matches from NYC Planning GeoSearch; `film_map_geography.json` retains those matches and identifies representative public approaches for streets, parks and historical piers. Coordinates are venue or approach points, not surveyed camera positions.

Every added frame was downloaded and visually inspected. The source lists mix movie frames with later comparison photographs; those photographs were explicitly rejected. Where interior shots could misrepresent an actual NYC building, recognizable film exteriors were selected instead. In particular, the Flatiron/Daily Bugle, Oscorp, Harry Osborn’s loft, the United Nations and Carnegie Hall use exterior frames. The Spider-Man wrestling-venue candidate was excluded because its aerial image and stated address disagree.

Shared venues remain one place with separate film associations and frames. Film imagery is kept at low resolution with source credits; no open license or reuse permission is asserted. Two pre-existing Anora associations still lack a verified matching frame and retain explicit missing-image text.

`film_map_source_audit.json` records the per-film coverage and unresolved candidates. Rizzoli and FAO Schwarz are held because the cited addresses opened after Manhattan (1979); a later store address must not replace a historical one. Annie Hall’s waterfront conversation is corrected to Pier 16 using independent matched-location studies, and its balcony is refined to 36 East 68th Street.

The catalog is a growing selection, not a claim to include every shot or every location. Repeated views of the same venue do not create new pins. Broad river/park shots, disputed historical addresses and unverified street blocks remain excluded pending specific evidence.

## Interaction

The landscape film shelf shows each film’s year and place count. It reuses the existing Music Map scroll hook: automatic movement at 36 px/s, an explicit pause/resume control, manual scrolling, delayed resumption after manual input, and keyboard-focus/reduced-motion suppression. It never changes the selected film or place automatically.

The selected scene occupies a wider reading pane. Film labels can remain visible on the map without changing the visitor’s center/zoom. Search, film filtering, clustered pins, the all-places control, list selection, keyboard selection and failed-map/media fallbacks stay available.

## Validation boundary

Source checks cover catalog uniqueness, film/source relationships, local JPEG signatures, exact image provenance and allowed Google endpoints. Supported browser checks inspect desktop and a 390px iframe layout; these do not emulate physical devices. CI additionally exercises Chromium and WebKit desktop/mobile flows. Google frames intercepted by CI establish URL/count contracts, not real Google authorization. This pass does not inspect or change the user’s Google Cloud billing or key restrictions.
