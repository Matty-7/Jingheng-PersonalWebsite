# Desk market motion

Jingheng requested a wireless mouse to the right of the Bloomberg keyboard and changing screen numbers and curves. This is decorative market activity in the existing illustration, using finite synthetic values rather than a live data feed.

The read-only critic and design editor accepted `MARKET_NUMBERS_STATIC` and `MARKET_CURVE_STATIC`: the previous effects only swept light across an unchanged bitmap. The replacement SVG stays registered to the existing 1672 × 941 artboard and inside three screen panels. Five quote rows each cycle through three distinct readings, staggered over 9–13 seconds. Three different line geometries crossfade over 12 seconds. Nine histogram bars change height on fixed baselines over 6–9 seconds. The original pie, heatmap and upper candlestick panel remain part of the illustration.

Every animated element uses the existing `scene-motion` gate. The desk pause button freezes the frames, and existing offscreen/background-tab detection suspends them. Reduced-motion preference, missing container units or missing IntersectionObserver retain the complete static illustration. No shared-hook changes, JavaScript timers, external data requests, new dependencies or live-data labels are added. Decorative figures stay out of the accessibility tree.

One bounded imagegen edit adds a charcoal cordless mouse immediately right of the keyboard. The 1672 × 941 result was inspected locally and converted to WebP without repainting. Screen and desk registration are visually preserved, though other pixels are not guaranteed identical. No toys were restored.

Verification covers source, local asset inspection, animation timing and panel coordinates, plus the required lint, TypeScript, publication tests, collection/content checks and production build. No browser, rendered viewport or interaction testing was requested or performed. Other collections, essays and publication metadata remain unchanged.
