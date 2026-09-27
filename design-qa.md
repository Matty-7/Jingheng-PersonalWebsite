# Mortgage Map design QA

- Selected source: `/workspace/scratch/61c1c734e7b4/generated_images/exec-45f47bf5-b7ee-4983-bdf4-1c321a03df7a.png` (third displayed concept, 1487 × 1058 pixels).
- Implemented capture: `/workspace/scratch/mortgage_learning_desktop_final.jpg`; normalized content: `outputs/mortgage_learning/desktop.png`.
- Full-view comparison: `outputs/mortgage_learning/design_comparison.png`, inspected with both images in the same frame.
- CSS viewport: 1488 × 1056 in the existing development-only iframe harness. The harness scales this frame to 85%; the supported screenshot renderer further normalizes 1363 × 936 to 1348 × 926. The iframe content crop is 1251 × 888. Both views were normalized to 900 × 640 for comparison; no application content is scaled in production.
- State: refinancing incentive, illustrative replacement rate 5.0%, details collapsed. Implementation shows a genuinely completed incentive node from the exercised learning flow; mock example progress is intentionally not pre-populated.
- Mobile capture: `/workspace/scratch/mortgage_learning_mobile_final.jpg`, 390 × 844 CSS iframe. This is a responsive layout check, not a claim of physical-device testing.

## Findings and comparison history

1. Initial implementation inherited the homepage's dark footer and serif brand heading. P2: inconsistent with the selected design. Fixed scoped footer and heading styling; inspected the next rendered capture.
2. The larger display heading wrapped over three lines after typography calibration. P2: disrupted the learning-stage proportions. Removed the overly narrow character limit and adjusted the font size. The final paired comparison shows the intended two-line heading.
3. Mobile initially required scrolling to the primary action. P2: interaction affordance outside the opening viewport. Added a compact sticky bottom action row; captured the mobile view again and activated the challenge using the supported browser. The question receives focus.
4. No actionable P0/P1/P2 findings remain. Minor P3: the library sprout icon and native accessible slider differ slightly from the mock's decorative tree mark and slider treatment.

## Required fidelity surfaces

- Typography: sans-serif navigation and controls, serif two-line lesson heading, large contrasting rate values; readable body sizes and no clipped labels.
- Spacing/layout: shallow local tree above the two-column lesson stage; same major-region proportions; sources are disclosed in place. The mobile variant has four immediately visible nodes and ordinary vertical scrolling.
- Colors/tokens: warm white, dark ink, muted evergreen, quiet separators and a pale green feedback surface. Correct/incorrect states also have text, not color alone.
- Assets: existing Lucide icons, semantic HTML controls and DOM-measured SVG learning connections. No decorative raster assets are required by this design. Connections are functional data visualization, not imitated image assets.
- Copy: real catalog titles replace illustrative labels; new-browser progress starts at zero; rate examples are marked illustrative and mention costs/eligibility. The title remains Mortgage Map.

## Interaction evidence

Verified in the supported cloud browser: changing replacement rates; incorrect answer blocks completion; correct answer reveals explanation; completion advances to Prepayments and marks the previous node; reload restores progress; catalog search autofocus; OAS lookup; deep-link updates; revealing MathML, sources and related reading; returning from a detour to the unchanged learning anchor; mobile challenge activation and focus.

Console checked after these interactions: no application errors; browser-extension metadata errors were excluded by their `chrome-extension:` source URL. Full regression coverage is assigned to exact-head Site checks CI, including desktop, mobile, short, WebKit and touch projects. Unit checks cover all 228 concepts, bounded trees, validated persistence, wraparound recommendations and rate-feedback boundaries.

## Implementation checklist

- [x] Resolve and implement the selected third image.
- [x] Compare source and rendered implementation together.
- [x] Fix substantive differences and recapture.
- [x] Exercise the main desktop and mobile journeys.
- [x] Keep underlying concepts, formulas and public references reachable.

final result: passed
