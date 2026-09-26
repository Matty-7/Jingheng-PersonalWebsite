# New York Atlas

Approved by Jingheng on September 26, 2026: combine the Film, Literary and Music projects into one place-oriented project. `/portfolio/new-york-atlas` is the primary entry from the homepage. Original collection routes remain available, including query links, film shelves, music overview and playlist export.

`lib/new_york_atlas.ts` adapts the unchanged source catalogs. One record represents a scene and location, a literary passage, or a track and place. Counts distinguish works from connections; overlapping location catalogs are never summed as unique places. All source text, coordinates, relationship types, credits and media stay in their original catalogs.

`atlas_areas` contains explicit, conservative area associations. “Around Washington Square” connects the arch, streets and square without claiming they are the same pin. Each selected record uses its original Maps helper and precision notes. Unassociated places link only to records using the same source-catalog place identity. Expand associations after checking the original location records; never merge by coordinate proximity alone.

The Atlas owns `medium`, `q` and `entry` URL parameters through `useMapLocation`. Search spans titles, creators and locations; filters intersect the query. Invalid links normalize to a matching record, and empty results remove selected detail and map. Related-work navigation clears the current query/category, preserving unrelated URL parameters. Desktop results use ten-item pages; mobile uses a native place/work selector. One user-initiated audio element uses the existing music-preview hook.

The shared `GOOGLE_MAPS_EMBED_API_KEY` binding and existing place-only Embed URLs preserve the strict $0 integration boundary in `docs/google_maps.md`. No Google location lookup or paid API is introduced. Missing configuration retains original content and keyless Maps links. Browser fixture tests validate application behavior, not actual cross-origin Google rendering or Cloud billing.

Accepted specification: ATLAS-01 geographic integrity, ATLAS-02 complete source/legacy-route retention, ATLAS-03 unified search/navigation. Independent review and publication evidence belong in the implementation PR.
