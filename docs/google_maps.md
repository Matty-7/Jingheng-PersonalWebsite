# Google Maps: strict $0 policy

Jingheng requires the Literary, Music and Film Map Google features to incur no
Google Maps charges. This is a standing project constraint, confirmed
September 20, 2026.

## Current integration

New York Atlas combines the three catalogs. Its interactive map uses MapLibre
with OpenFreeMap tiles; Google Maps is an external destination link only.
`lib/google_maps.ts` creates keyless
`https://www.google.com/maps/search/?api=1&query=...` URLs. Film destinations
use reviewed catalog queries or addresses. Literary and music destinations
use reviewed coordinates. No Google data lookup service is called.

The old selected-place Embed URL builders, runtime key reader and unused
`map_url` detail field were removed after confirming that the Atlas interface
no longer consumed them. The existing `GOOGLE_MAPS_EMBED_API_KEY` environment
configuration has not been changed; current application code does not read it.

Human-readable `map_query` metadata and offline-generated Plus Codes remain
as geographic provenance. When changing a coordinate, regenerate its
`plus_code`. Independent decoder tests check the official fixtures and that
every catalog coordinate is inside its code cell. These tests do not verify
Google rendering. See `docs/literary_map_geography.md` for coordinate review.

## Constraints on future changes

Only the no-charge Maps Embed API and keyless Maps URLs are authorized. Do not
add Maps JavaScript, Places, Geocoding, Routes, Static Maps or paid Street View
APIs. Free monthly allowances, trial credits and budget alerts do not satisfy
the $0 constraint. No automatic fallback to a billable API is permitted.
Recheck official pricing before changing this integration. If embedding is
reintroduced, use the same configured key, keep its value out of Git, and
retain usable keyless links when embedding is unavailable.

The prior Embed key restrictions remain applicable to any future Embed use:
Maps Embed API only, with Website restrictions to `https://jinghenghuan.com/*`
and `https://www.jinghenghuan.com/*`. Google Cloud settings have not been
inspected or changed in this cleanup. Source checks establish only which
APIs this website calls, not the billing state of the Cloud project or use of
the same key elsewhere.

## Verification and references

`npm test` checks destination encoding, keyless Google Maps URLs across every
Atlas entry and the existing guard against metered Google APIs or hardcoded
keys. Browser tests use map fixtures and require no fake Google key.

Official references from the prior integration review (September 20 and 26,
2026; pricing was not rechecked for this removal):

- https://developers.google.com/maps/documentation/embed/usage-and-billing
- https://developers.google.com/maps/documentation/embed/embedding-map
- https://developers.google.com/maps/documentation/urls/get-started
- https://developers.google.com/maps/api-security-best-practices
- https://github.com/google/open-location-code/blob/main/js/src/openlocationcode.js
