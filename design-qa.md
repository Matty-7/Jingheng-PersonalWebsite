# Design QA

## Atlas design QA

Final result: passed

### Visual truth and evidence

- Selected concept: option 2, Open City. Source: `/workspace/scratch/f7c2d1718f7a/generated_images/exec-ec7d0a05-e70d-408e-b710-08842076ebba.png` (1487 × 1058 pixels).
- Browser-rendered desktop: `/workspace/scratch/atlas_final_20260927.jpg`. The development iframe supplies 1488 × 1056 CSS pixels, scaled to .86 to fit the browser's screenshot capability. Capture is 1348 × 926 pixels; the app region is approximately 1266 × 899. The outer gray canvas and scrollbar are the audit wrapper, not the Atlas viewport.
- Full combined comparison: `/workspace/scratch/f7c2d1718f7a/atlas_comparison_final.jpg`; source normalized to the same 1266 × 899 image region. Focused card comparison: `/workspace/scratch/f7c2d1718f7a/atlas_regions_final.jpg`.
- Mobile: `/workspace/scratch/f7c2d1718f7a/atlas_mobile.png`, cropped to the actual 390 × 844 CSS viewport at 1:1. DOM measurements confirmed scrollWidth = 390 and scrollHeight = 844.
- State: All category, You've Got Mail at 91st Street Garden. The implementation capture has an active search; therefore only its matching pin appears. The mock shows an illustrative unfiltered set. Pin count, camera center and catalog text are not pixel-match claims.

### Comparison and findings

The first combined comparison used Café Lalo and showed a denser, louder real raster map than the concept. P2: the tile layer competed with the card. Fixed by reducing saturation, contrast and opacity while leaving pins and attribution independent. The final combined comparison uses the same work/place as the mock and confirms the quieter hierarchy. No actionable P0/P1/P2 visual findings remain.

- Typography: Georgia display headings and system UI text preserve the serif/sans hierarchy. A 32px desktop brand and 29px place title remain legible; the 21px mobile place title wraps within its card. Keyboard focus is visibly outlined; the final mouse-state capture has no spurious outline.
- Spacing: slim 76px toolbar, full-height map and one bottom card match the concept. Card grid, image frame and actions are shared by all three media. Mobile stacks the toolbar and uses a compact two-column card with one action row. Search suggestions and the source dialog are temporary surfaces.
- Colors: warm white, forest green, muted gray, rust accent and subdued map tiles follow the target. Category and selection states stay distinct.
- Assets: actual catalog film stills, book covers and album artwork are used, with credits retained. A shared frame crops film stills and contains covers without distortion. The film frame differs from the generated mock's illustrative frame intentionally. Lucide icons and Leaflet controls are standard UI assets.
- Copy: concise place/work/year, two-line summary and a small precision note. Full source text appears only on request. “Google Maps” names the external destination accurately; the mock's generic “Directions” label was not copied. No collection navigation or explanatory page essay remains.
- Intentional map difference: standard OpenStreetMap tiles have more cartographic detail than the generated illustration. Keeping an accurate interactive map, original coordinates and the strict $0 Google boundary takes priority over reproducing fictional map art.

### Interaction and runtime evidence

Observed in the managed browser preview: initial mixed map, search and selection for film/literature/music, identical card structure, source dialog content, Escape closing the dialog while preserving the selected card, focus restoration to Info, image rendering and mobile layout. Music remains silent until the user presses Preview. Map and artwork use real assets in these observations.

Console inspection found no new application errors on the final clean loads. An earlier development hot-reload error referenced a disposed Leaflet map; lifecycle guards now prevent effects from touching the disposed instance. Browser-extension metadata errors are unrelated to application code.

Focused data tests: 16 passed. Lint, TypeScript and production build passed. Static Atlas JavaScript remains under the existing budget. Local Playwright production startup was blocked before tests by the environment's `uv_interface_addresses` error; no local browser-suite pass is claimed. The required full cross-browser suite runs in GitHub CI, and is a separate merge gate. Device emulation, network/error fixtures and audio lifecycle are covered there, not certified by the desktop iframe observations.

### Implementation checklist

- Map-first shared interface and responsive card implemented.
- Source data, precision notes and credits retained.
- Three legacy interfaces removed; legacy selected URLs permanently redirect.
- Viewport overflow and required visual surfaces checked.
- Independent exact-head review and full CI remain mandatory before merge.

## Mortgage Map design QA

- Selected source: `/workspace/scratch/61c1c734e7b4/generated_images/exec-45f47bf5-b7ee-4983-bdf4-1c321a03df7a.png` (third displayed concept, 1487 × 1058 pixels).
- Implemented capture: `/workspace/scratch/mortgage_learning_desktop_final.jpg`; normalized content: `outputs/mortgage_learning/desktop.png`.
- Full-view comparison: `outputs/mortgage_learning/design_comparison.png`, inspected with both images in the same frame.
- CSS viewport: 1488 × 1056 in the existing development-only iframe harness. The harness scales this frame to 85%; the supported screenshot renderer further normalizes 1363 × 936 to 1348 × 926. The iframe content crop is 1251 × 888. Both views were normalized to 900 × 640 for comparison; no application content is scaled in production.
- State: refinancing incentive, illustrative replacement rate 5.0%, details collapsed. Implementation shows a genuinely completed incentive node from the exercised learning flow; mock example progress is intentionally not pre-populated.
- Mobile capture: `/workspace/scratch/mortgage_learning_mobile_final.jpg`, 390 × 844 CSS iframe. This is a responsive layout check, not a claim of physical-device testing.

### Findings and comparison history

1. Initial implementation inherited the homepage's dark footer and serif brand heading. P2: inconsistent with the selected design. Fixed scoped footer and heading styling; inspected the next rendered capture.
2. The larger display heading wrapped over three lines after typography calibration. P2: disrupted the learning-stage proportions. Removed the overly narrow character limit and adjusted the font size. The final paired comparison shows the intended two-line heading.
3. Mobile initially required scrolling to the primary action. P2: interaction affordance outside the opening viewport. Added a compact sticky bottom action row; captured the mobile view again and activated the challenge using the supported browser. The question receives focus.
4. No actionable P0/P1/P2 findings remain. Minor P3: the library sprout icon and native accessible slider differ slightly from the mock's decorative tree mark and slider treatment.

### Required fidelity surfaces

- Typography: sans-serif navigation and controls, serif two-line lesson heading, large contrasting rate values; readable body sizes and no clipped labels.
- Spacing/layout: shallow local tree above the two-column lesson stage; same major-region proportions; sources are disclosed in place. The mobile variant has four immediately visible nodes and ordinary vertical scrolling.
- Colors/tokens: warm white, dark ink, muted evergreen, quiet separators and a pale green feedback surface. Correct/incorrect states also have text, not color alone.
- Assets: existing Lucide icons, semantic HTML controls and DOM-measured SVG learning connections. No decorative raster assets are required by this design. Connections are functional data visualization, not imitated image assets.
- Copy: real catalog titles replace illustrative labels; new-browser progress starts at zero; rate examples are marked illustrative and mention costs/eligibility. The title remains Mortgage Map.

### Interaction evidence

Verified in the supported cloud browser: changing replacement rates; incorrect answer blocks completion; correct answer reveals explanation; completion advances to Prepayments and marks the previous node; reload restores progress; catalog search autofocus; OAS lookup; deep-link updates; revealing MathML, sources and related reading; returning from a detour to the unchanged learning anchor; mobile challenge activation and focus.

Console checked after these interactions: no application errors; browser-extension metadata errors were excluded by their `chrome-extension:` source URL. Full regression coverage is assigned to exact-head Site checks CI, including desktop, mobile, short, WebKit and touch projects. Unit checks cover all 228 concepts, bounded trees, validated persistence, wraparound recommendations and rate-feedback boundaries.

### Implementation checklist

- [x] Resolve and implement the selected third image.
- [x] Compare source and rendered implementation together.
- [x] Fix substantive differences and recapture.
- [x] Exercise the main desktop and mobile journeys.
- [x] Keep underlying concepts, formulas and public references reachable.

final result: passed
