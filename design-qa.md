# Atlas design QA

Final result: passed

## Visual truth and evidence

- Selected concept: option 2, Open City. Source: `/workspace/scratch/f7c2d1718f7a/generated_images/exec-ec7d0a05-e70d-408e-b710-08842076ebba.png` (1487 × 1058 pixels).
- Browser-rendered desktop: `/workspace/scratch/atlas_final_20260927.jpg`. The development iframe supplies 1488 × 1056 CSS pixels, scaled to .86 to fit the browser's screenshot capability. Capture is 1348 × 926 pixels; the app region is approximately 1266 × 899. The outer gray canvas and scrollbar are the audit wrapper, not the Atlas viewport.
- Full combined comparison: `/workspace/scratch/f7c2d1718f7a/atlas_comparison_final.jpg`; source normalized to the same 1266 × 899 image region. Focused card comparison: `/workspace/scratch/f7c2d1718f7a/atlas_regions_final.jpg`.
- Mobile: `/workspace/scratch/f7c2d1718f7a/atlas_mobile.png`, cropped to the actual 390 × 844 CSS viewport at 1:1. DOM measurements confirmed scrollWidth = 390 and scrollHeight = 844.
- State: All category, You've Got Mail at 91st Street Garden. The implementation capture has an active search; therefore only its matching pin appears. The mock shows an illustrative unfiltered set. Pin count, camera center and catalog text are not pixel-match claims.

## Comparison and findings

The first combined comparison used Café Lalo and showed a denser, louder real raster map than the concept. P2: the tile layer competed with the card. Fixed by reducing saturation, contrast and opacity while leaving pins and attribution independent. The final combined comparison uses the same work/place as the mock and confirms the quieter hierarchy. No actionable P0/P1/P2 visual findings remain.

- Typography: Georgia display headings and system UI text preserve the serif/sans hierarchy. A 32px desktop brand and 29px place title remain legible; the 21px mobile place title wraps within its card. Keyboard focus is visibly outlined; the final mouse-state capture has no spurious outline.
- Spacing: slim 76px toolbar, full-height map and one bottom card match the concept. Card grid, image frame and actions are shared by all three media. Mobile stacks the toolbar and uses a compact two-column card with one action row. Search suggestions and the source dialog are temporary surfaces.
- Colors: warm white, forest green, muted gray, rust accent and subdued map tiles follow the target. Category and selection states stay distinct.
- Assets: actual catalog film stills, book covers and album artwork are used, with credits retained. A shared frame crops film stills and contains covers without distortion. The film frame differs from the generated mock's illustrative frame intentionally. Lucide icons and Leaflet controls are standard UI assets.
- Copy: concise place/work/year, two-line summary and a small precision note. Full source text appears only on request. “Google Maps” names the external destination accurately; the mock's generic “Directions” label was not copied. No collection navigation or explanatory page essay remains.
- Intentional map difference: standard OpenStreetMap tiles have more cartographic detail than the generated illustration. Keeping an accurate interactive map, original coordinates and the strict $0 Google boundary takes priority over reproducing fictional map art.

## Interaction and runtime evidence

Observed in the managed browser preview: initial mixed map, search and selection for film/literature/music, identical card structure, source dialog content, Escape closing the dialog while preserving the selected card, focus restoration to Info, image rendering and mobile layout. Music remains silent until the user presses Preview. Map and artwork use real assets in these observations.

Console inspection found no new application errors on the final clean loads. An earlier development hot-reload error referenced a disposed Leaflet map; lifecycle guards now prevent effects from touching the disposed instance. Browser-extension metadata errors are unrelated to application code.

Focused data tests: 16 passed. Lint, TypeScript and production build passed. Static Atlas JavaScript remains under the existing budget. Local Playwright production startup was blocked before tests by the environment's `uv_interface_addresses` error; no local browser-suite pass is claimed. The required full cross-browser suite runs in GitHub CI, and is a separate merge gate. Device emulation, network/error fixtures and audio lifecycle are covered there, not certified by the desktop iframe observations.

## Implementation checklist

- Map-first shared interface and responsive card implemented.
- Source data, precision notes and credits retained.
- Three legacy interfaces removed; legacy selected URLs permanently redirect.
- Viewport overflow and required visual surfaces checked.
- Independent exact-head review and full CI remain mandatory before merge.
