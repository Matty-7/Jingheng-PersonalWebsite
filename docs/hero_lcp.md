# Hero loading performance

September 9, 2026. Scope: `ROOM_LCP_LAZY` and `ROOM_IMAGE_TRANSFER`, accepted by the separate critic and design editor. Preserve the living-room artwork, crop, animation and JPEG compatibility.

The owner's Cloudflare report shows LCP P75 2,838 ms, P90 3,089 ms and a five-count debug row for `/images/living-room-motion.jpg`. This is a small field sample, not a controlled benchmark. The soft-navigation measurement rollout can also change aggregate reporting. INP and CLS do not identify the bottleneck in this sample.

Production HTML on the original revision (`e10802495a1b9ef75a51132473221a8cd1f79961`) returned the hero with `loading="lazy"`, despite `fetchPriority="high"`, and no matching preload. The installed image component defaults to lazy loading. Explicit eager loading removes the layout-dependent discovery gate. React's preload API emits a matching high-priority hint from the homepage's room component; it deduplicates the same URL across renders and decorative layers without adding a hero download to the journal layout.

The JPEG is re-encoded at quality 82, 4:2:0 chroma, optimized progressive encoding. Dimensions remain 1672 by 941. Transfer falls from 349,186 to 192,362 bytes, a 44.9% reduction. All three room layers keep the same URL and coordinates. No PNG, artwork geometry, article prose, motion timing or image error handling changes.

`npm test` now renders the actual room component through the installed image implementation and checks eager loading and one high-priority preload. It also enforces a 210,000-byte JPEG budget. These checks run in the existing Site checks CI and recurring audit workflow.

Deferred: decorative PNG resizing, responsive variants and early turntable-mask loading. The latter has source evidence but needs a supported runtime request trace before changing the player lifecycle. A narrow hero repair does not certify the full visitor-audit checklist.

Follow-up: inspect fresh Cloudflare samples after deployment, separating hard navigation from soft navigation and mobile from desktop where available. Target LCP P75 below 2,500 ms; do not describe byte savings or source-preview observations as a measured field-speed gain. Preserve sample counts and the observation window. The current connector does not expose the owner's Cloudflare dashboard data.

References: [LCP optimization](https://web.dev/articles/optimize-lcp), [Cloudflare soft-navigation measurement](https://developers.cloudflare.com/changelog/post/2026-08-21-improved-soft-navigation-measurement-for-single-page-applications/).
