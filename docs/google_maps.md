# Google Maps: external links only

On October 1, 2026, Jingheng discontinued all Google Maps API use and key
configuration. Only keyless external destination links remain authorized.
This supersedes the September 20 authorization for Maps Embed API use.

## Current integration

New York Atlas combines the three catalogs. Its interactive map uses MapLibre
with OpenFreeMap tiles; Google Maps is an external destination link only.
`lib/google_maps.ts` creates keyless
`https://www.google.com/maps/search/?api=1&query=...` URLs. Film destinations
use reviewed catalog queries or addresses. Literary and music destinations
use reviewed coordinates. No Google data lookup service is called.

The old selected-place Embed URL builders, runtime key reader and unused
`map_url` detail field have been removed. No Google Maps API key is required
in source, local configuration or the Sites environment. Remove any legacy
Google Maps key binding rather than restoring it.

Human-readable `map_query` metadata and offline-generated Plus Codes remain
as geographic provenance. When changing a coordinate, regenerate its
`plus_code`. Independent decoder tests check the official fixtures and that
every catalog coordinate is inside its code cell. These tests do not verify
Google rendering. See `docs/literary_map_geography.md` for coordinate review.

## Constraints on future changes

Keep Google Maps as a user-initiated external link only. Do not add embeds,
Google Maps SDKs, API requests, keys, environment bindings or Google-powered
fallbacks. Free monthly allowances, trial credits and no-charge endpoints
do not change this restriction. API use requires fresh explicit authorization
from Jingheng.

The `api=1` parameter selects the Maps URL format; it is not an API key.
Keep the existing destination encoding and catalog coordinates intact.
Source checks establish what this website calls, not the billing state of
a Google Cloud project or use of a key elsewhere.

## Verification and references

`npm test` checks destination encoding, keyless Google Maps URLs across every
Atlas entry and the guard against Google Maps APIs, embeds, key bindings and
hardcoded keys. Browser tests use map fixtures and require no Google key.

References for the retained URL format and offline geographic metadata:

- https://developers.google.com/maps/documentation/urls/get-started
- https://github.com/google/open-location-code/blob/main/js/src/openlocationcode.js
