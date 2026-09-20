# Google Maps: strict $0 policy

Jingheng requires the Literary, Music and Film Map Google features to incur no Google Maps charges. This is a standing project constraint, confirmed September 20, 2026.

All three routes read the same `GOOGLE_MAPS_EMBED_API_KEY` runtime binding and pass it to the shared `lib/google_maps.ts` helper. The real value is configured in the Sites environment, not committed. An Embed browser key is visible to visitors in the iframe URL by design; marking the runtime value secret protects configuration storage, not browser visibility.

The only keyed endpoint allowed is `https://www.google.com/maps/embed/v1/place`. Google currently documents Maps Embed API as no charge, with unlimited requests. External place links use `https://www.google.com/maps/search/?api=1&query=...` and never carry the key. Coordinates and queries come from existing catalogs; no Google data lookup service is called.

Do not add Maps JavaScript, Places, Geocoding, Routes, Static Maps or paid Street View APIs. Do not interpret free monthly allowances, trial credits or budget alerts as a guarantee against charges. No automatic fallback to a billable API is permitted. Recheck official pricing before changing this integration. If free embedding becomes unavailable, keep the external Maps links.

Missing runtime configuration omits the Google iframe and leaves the destination and external link usable. Cross-origin iframe failures cannot be reliably inspected by the application. Never claim successful Google rendering based only on an iframe load event.

The Film Map keeps its existing OpenStreetMap multi-location overview. Its selected location details mount at most one Google iframe; closed locations do not load Google maps. Music and Literary Map keep one selected-place iframe each, with their original query and zoom behavior.

## Google Cloud restrictions

The key owner should set API restrictions to **Maps Embed API only**, and Website restrictions to `https://jinghenghuan.com/*` and `https://www.jinghenghuan.com/*`. Do not broadly allow other origins. Disable unneeded billable Maps APIs in a project dedicated to these maps. These Google Cloud settings have not been inspected or changed in this task; an API key alone does not grant permission to administer them. Source checks establish only which APIs this website calls, not the billing state of the Cloud project or use of the same key elsewhere.

## Verification

The URL contract and cost guard run in `npm test`. Browser tests use an explicitly fake Embed key supplied as a local Wrangler binding and intercept Google frames where applicable. They verify routing, selection, iframe counts and usable fallback links, not Google authorization or real tile rendering.

Official references, checked September 20, 2026:

- https://developers.google.com/maps/documentation/embed/usage-and-billing
- https://developers.google.com/maps/documentation/embed/embedding-map
- https://developers.google.com/maps/documentation/urls/get-started
- https://developers.google.com/maps/api-security-best-practices
