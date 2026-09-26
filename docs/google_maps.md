# Google Maps: strict $0 policy

Jingheng requires the Literary, Music and Film Map Google features to incur no Google Maps charges. This is a standing project constraint, confirmed September 20, 2026.

All three routes read the same `GOOGLE_MAPS_EMBED_API_KEY` runtime binding and pass it to the shared `lib/google_maps.ts` helper. The real value is configured in the Sites environment, not committed. An Embed browser key is visible to visitors in the iframe URL by design; marking the runtime value secret protects configuration storage, not browser visibility.

The only keyed endpoint allowed is `https://www.google.com/maps/embed/v1/place`. Google currently documents Maps Embed API as no charge, with unlimited requests. External place links use `https://www.google.com/maps/search/?api=1&query=...` and never carry the key. Coordinates and queries come from existing catalogs; no Google data lookup service is called.

Do not add Maps JavaScript, Places, Geocoding, Routes, Static Maps or paid Street View APIs. Do not interpret free monthly allowances, trial credits or budget alerts as a guarantee against charges. No automatic fallback to a billable API is permitted. Recheck official pricing before changing this integration. If free embedding becomes unavailable, keep the external Maps links.

Missing runtime configuration omits the Google iframe and leaves the destination and external link usable. Cross-origin iframe failures cannot be reliably inspected by the application. Never claim successful Google rendering based only on an iframe load event.

The Film Map uses one primary Google selected-place iframe, like the Literary Map. Film filtering, search, a location selector and previous/next controls expose the complete catalog; the free place embed shows one selected location, not all custom pins at once. Film has no Leaflet/OpenStreetMap map or duplicate detail iframe. Closing scene details retains the selected map destination. Empty search results remove the iframe and stale destination link, while missing configuration leaves the selected place and keyless link usable. Music retains its optional OpenStreetMap multi-location overview alongside its selected-place Google mode. Literary locations use reviewed coordinates: a full, offline-generated Plus Code identifies the marker, the same coordinates set the map center, and keyless Maps URLs open those coordinates. Human-readable map_query metadata is retained for geographic provenance, not runtime geocoding. Area and historical-location notes still describe the limits of each literary identification.

## Google Cloud restrictions

The key owner should set API restrictions to **Maps Embed API only**, and Website restrictions to `https://jinghenghuan.com/*` and `https://www.jinghenghuan.com/*`. Do not broadly allow other origins. Disable unneeded billable Maps APIs in a project dedicated to these maps. These Google Cloud settings have not been inspected or changed in this task; an API key alone does not grant permission to administer them. Source checks establish only which APIs this website calls, not the billing state of the Cloud project or use of the same key elsewhere.

## Verification

The URL contract and cost guard run in `npm test`. Browser tests use an explicitly fake Embed key supplied as a local Wrangler binding and intercept Google frames where applicable. They verify routing, selection, iframe counts and usable fallback links, not Google authorization or real tile rendering.

Official references, checked September 20, 2026:

- https://developers.google.com/maps/documentation/embed/usage-and-billing
- https://developers.google.com/maps/documentation/embed/embedding-map
- https://developers.google.com/maps/documentation/urls/get-started
- https://developers.google.com/maps/api-security-best-practices


Literary coordinate review (September 21, 2026): see `docs/literary_map_geography.md`. Full ten-digit Plus Codes are generated offline with Google’s Apache-licensed [Open Location Code implementation](https://github.com/google/open-location-code/blob/main/js/src/openlocationcode.js), using `encode(latitude, longitude)`. No encoding dependency or location lookup is shipped to visitors. When changing a coordinate, regenerate its `plus_code`; independent decoder tests check the official fixtures and that every catalog coordinate is inside its code cell. Browser contract tests check all selections, but actual Google pin rendering requires a separate supported browser inspection.

Film primary-map migration (September 26, 2026): the existing shared Embed key and place-only endpoint are unchanged. Official Embed usage/billing and embedding documentation were rechecked on this date. No Google account sign-in or My Maps import is needed.
