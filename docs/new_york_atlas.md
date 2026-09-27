# New York Atlas

Approved by Jingheng on September 26, 2026: combine the Film, Literary and Music projects into one place-oriented project. `/portfolio/new-york-atlas` is the primary entry from the homepage. Original collection routes remain available, including query links, film shelves, music overview and playlist export.

`lib/new_york_atlas.ts` adapts the unchanged source catalogs. One record represents a scene and location, a literary passage, or a track and place. Counts distinguish works from connections; overlapping location catalogs are never summed as unique places. All source text, coordinates, relationship types, credits and media stay in their original catalogs.

`atlas_areas` contains explicit, conservative area associations. “Around Washington Square” connects the arch, streets and square without claiming they are the same pin. Each selected record uses its original Maps helper and precision notes. Unassociated places link only to records using the same source-catalog place identity. Expand associations after checking the original location records; never merge by coordinate proximity alone.

The Atlas owns `medium`, `q` and `entry` URL parameters through `useMapLocation`. Search spans titles, creators and locations; filters intersect the query. Invalid links normalize to a matching record, and empty results remove selected detail and map. Related-work navigation clears the current query/category, preserving unrelated URL parameters. Desktop results use ten-item pages; mobile uses a native place/work selector. One user-initiated audio element uses the existing music-preview hook.

The shared `GOOGLE_MAPS_EMBED_API_KEY` binding and existing place-only Embed URLs preserve the strict $0 integration boundary in `docs/google_maps.md`. No Google location lookup or paid API is introduced. Missing configuration retains original content and keyless Maps links. Browser fixture tests validate application behavior, not actual cross-origin Google rendering or Cloud billing.

Accepted specification: ATLAS-01 geographic integrity, ATLAS-02 complete source/legacy-route retention, ATLAS-03 unified search/navigation. Independent review and publication evidence belong in the implementation PR.

September 26 refinement, requested by Jingheng: a quieter, place-first layout with compact navigation, segmented filters, softly separated surfaces and readable editorial headings. The result list prioritizes location and work; author and year remain in the selected detail. Full relationship and geographic precision remain visible. Visiting guidance, additional scene sources and the collection explanation use native disclosures; all original text, source links and image credits remain available. Accepted polish scope: ATLAS-P01 first-screen hierarchy, ATLAS-P02 result readability, ATLAS-P03 progressive disclosure. Search, URL state, catalogs, the audio hook and Google helpers are unchanged.

September 27 loading refinement: the initial browser receives a compact search index and only the selected detail, rendered on the server from the same URL codec. `lib/atlas_browser.ts` contains catalog-free search and URL logic; normalized search text is prepared once from all original searchable fields. `lib/new_york_atlas.ts` retains the complete catalogs on the server and assembles selected map URLs, source credits and nearby connections.

`/api/atlas-entry?entry=…` returns one public Atlas detail, with unknown IDs returning 404. Responses are not cached across releases. `useAtlasDetail` caches successful selections for the mounted explorer, cancels superseded requests and rejects mismatched responses. Loading and failure states never display a previous work as the new selection. Failure leaves retry and a normal full-page link to the selected record. First-load and no-JavaScript detail remain server-rendered; previews remain user initiated, with the same single audio element.

Atlas links disable automatic route prefetch so neighboring full collections do not download in the background before a visitor opens them.

The static JavaScript budget for the Atlas is 470,000 raw / 150,000 gzip bytes, including static imports. The serialized index has its own 160,000-byte test budget. Neither number is a field performance score or a complete page-transfer measurement. Browser scenarios cover cold linked selections without a detail request, history-cache reuse, stale-response protection and retry after HTTP or identity failure, alongside the existing complete cross-browser suite.
