# Broadway Playbill collection

Jingheng requested SIX, Chicago, The Book of Mormon and Mamma Mia! alongside the existing Two Strangers on September 8, 2026. All five use complete portrait Playbill covers with their yellow mastheads intact. `content/playbills.json` records the production page, direct artwork source and edition context. The cover editions do not indicate when Jingheng attended or which cast he saw.

Four covers come directly from Playbill’s asset service. The Book of Mormon uses the familiar leaping missionary and doorbell cover reproduced by Dance Molinari; its issue date is unverified. This choice keeps the collection’s conventional yellow mastheads consistent. The downloads were encoded as WebP without retouching or cropping. Chicago links to the 1996 revival production, matching the Ambassador Theatre cover, rather than the older production page through which search indexed the image.

`components/playbill_collection.tsx` owns one selected-show state. Five ordinary pressed buttons select a complete cover, title and production link together. Buttons retain native keyboard activation, visible focus, and at least 52px row targets. There is no automatic cycling or drag requirement. The existing rust and cream palette, slight paper tilt and shadow remain. A 420ms paper arrival runs when a different cover is selected; the global reduced-motion rule disables it. The initial Two Strangers content is rendered statically.

The existing “New York” track, Sam Tutty & Dujonna Gift credit, and Apple Music link appear only under Two Strangers and are explicitly labelled Original London Cast Recording. The Broadway cover is not presented as that recording’s artwork. The other shows introduce no music links, attendance claims or personal reviews. The ten books, ten films, ten songs, audio player and publication filtering are unchanged.

Verification consists of source review, full-cover asset inspection, content checks, lint, TypeScript, publication tests and a production build. No browser or interaction testing was performed.
