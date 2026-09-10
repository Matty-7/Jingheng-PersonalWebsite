# Performance review

## 2026-09-10

User scope: inspect the whole repository and keep improving performance within the existing reviewed daily maintenance process. Preserve the current content, artwork, layout, audio behavior and publication gates.

Baseline: deployed `f4dec22d3a9707abd6197b330baf1507eae04642` (PR #27, version 35). Reviewed application routes, components, CSS, content loading, assets, client build output, configuration and checks. Vendored UI was inspected through imports and build output, without speculative dependency removal.

| Issue | Decision | Evidence / next acceptance |
| --- | --- | --- |
| HOME_AUDIO_RENDER_SCOPE | Accepted and repaired | Audio progress state lived in Home. A stable RecordsPlayer now owns the records section, audio, mini-player and registration lifecycle. Progress no longer updates Home or unrelated collection components. |
| SCROLL_LAYOUT_INTERLEAVING | Deferred | Film scroll updates interleave geometry reads and style writes for ten posters, including while offscreen. Obtain supported timing/geometry evidence before changing the animation; preserve normal scrolling and reduced-motion behavior. The parallax selector currently has no authored targets. |
| TURNTABLE_MASK_EAGER | Deferred | The always-mounted SVG references a 1,587,947-byte PNG. Obtain initial request timing evidence before changing loading, as required in hero_lcp.md. SVG, CSS mask and probe share one URL; this does not mean three downloads. Preserve JPEG/PNG delivery compatibility. |

### Render comparison

Temporary console counters were inserted at Home and Bookshelf render entry, and at RecordsPlayer after extraction. They were read through the supported browser console and removed before the final build. These development-only probes were the only instrumentation; they are not production telemetry.

- Before extraction: with images settled, Home/Bookshelf counters were 3/4. After one real 30.019-second preview completed, they were 122/123: 119 additional executions each.
- After extraction: at 18.873 seconds of real playback, RecordsPlayer had reached 78 executions. After the complete 30.019-second preview it reached 122, while Home and Bookshelf remained at 1 each from the initial mount throughout. The progress updates stayed below the new component boundary.
- These counts demonstrate render isolation, not a measured percentage improvement in CPU, LCP or INP. No field-performance or corporate-network claim is made.

### Existing safeguards and follow-up

- The hero JPEG is already 192,362 bytes with a 210 KB regression budget and an eager high-priority preload. Do not redo that optimization without new evidence.
- Preserve actual lazy image behavior, single persistent audio with preload none, request sequencing and user-initiated playback. The new SSR regression checks the ten labelled records and dormant audio contract.
- Offscreen/hidden scene animations already pause through visibility handling. Draft and future-date filtering remains server-only; the newsletter archive retains one external article link.
- Initial client page chunk was 157,219 uncompressed bytes. Component extraction is a render optimization, not a promised transfer reduction. Do not equate declared unused dependencies with shipped client code.
- Continue through the existing daily audit with this backlog. Retain independent critic/editor/reviewer, browser checks, exact-head CI, publication ownership and receipts. Do not add monitoring services or weaken gates to obtain a pass.


## Cinema refinement, 2026-09-10

Base: `a60a6f05c210786546da788df92539cf5c31bf06`. The separate critic and editor accepted `FILM_PINNED_VIEWPORT_FIT` and the previously deferred `SCROLL_LAYOUT_INTERLEAVING` as one cinema refinement. Mobile channel density remains a deferred preference; artwork, content and logos are unchanged.

At 1440 by 900, the old sticky composition measured 980.47px, with footer/progress at y914.88–950.47. The desktop composition now uses a viewport-height grid, reserves caption space, and sizes posters from the available height. Screens below 680px high and browsers without container-height units retain the readable static grid, as do mobile and reduced-motion layouts.

The motion loop now caches untransformed card centres on initialization and ResizeObserver/viewport changes. Ordinary scroll reads page/hero/section geometry before style writes; it neither measures each poster nor rewrites section height. Clamped unchanged film progress skips film style writes outside its travel. The unused parallax query/loop was removed; there were no authored targets.

Temporary source-only console probes, read through the supported browser, showed 120 poster-bound reads over 12 baseline updates, including ten reads per update outside the film section. Afterward, the card-read count remained at20 across stable frames3–6 as the film top moved from90.48 to2353.48px; those scroll frames added zero card measurements. Initialization/ResizeObserver delivery accounts for the initial20. Probe elapsed times are not comparable field benchmarks; no CPU/LCP/INP percentage gain is claimed. All probes were removed.

Supported Chrome evidence: measured1440x900 and1280x720 viewports, near-start/middle/end pinned states, all ten posters decoded/reachable by ordinary scrolling. Heading top108/100px clears88px navigation; footer bottom880/700px fits the viewport. Long titles and metadata fit, including The Lovers on the Bridge and The Love That Remains. At390x844, ten decoded posters remain in a two-column grid without horizontal overflow. Temporary dev-harness buttons resized the same iframe to390x844 and1280x600 (motion class, height, transform and depth cleared), then1440x900 (motion restored). The harness was restored without a production diff.

This is a scoped cinema repair, not a complete daily visitor audit or a physical-device/Safari/corporate-network test. Reduced-motion preference and missing-container support are source-reviewed, not emulated. A browser-controller timeout interrupted the final multi-action readout; fresh DOM inspection confirmed the resulting mobile last row and restored desktop state. Production HTTP acceptance is recorded in the deployment receipt.

## Deferred turntable artwork, 2026-09-10

Base: `9f0dc2d6d13a48627b3c040b40391da6a98d9a4e`, verified Site version 38 and successful deployment `appgdep_6aa3191a6e0c81918096b4d546c6e453`. The separate critic and design editor accepted the previously deferred `TURNTABLE_MASK_EAGER` finding after supported source-preview observations. This foreground change is saved for review without merging or publishing.

Initial desktop navigation at 1440 by 900 had scrollY 0 and the turntable at y2188.52, yet Resource Timing already contained PNG entries initiated by an image and CSS. Their transferSize values were 300 bytes in the cached/revalidated preview. They establish premature discovery, not duplicate full downloads. The source PNG is 1,587,947 bytes; the JPEG base is 342,873 bytes.

`Turntable` now preserves the existing sized wrapper and mounts all decorative resource consumers together near the viewport. An IntersectionObserver uses a 600px vertical margin and disconnects permanently on activation. Without that API, activation falls back to the next animation frame. The mounted artwork owns both image-readiness hooks and eagerly requests its base/probe, while its visibility still requires both images to load. The SVG, mask, vinyl and image files retain their original coordinates and formats. Audio, track selection and controls remain in the persistent RecordsPlayer.

Supported Chrome source-preview evidence:

- Fresh desktop navigation: no turntable PNG/JPEG Resource Timing entries and no artwork img/SVG-image nodes. Wrapper geometry remained 582 by 437 CSS pixels before and after activation.
- The top-level preview (936px viewport height) still had no artwork at y1727.99. At y1427.99, within the 600px margin but below the visible viewport, the artwork mounted, both resources started and readiness became true. The iframe harness clips implicit-root intersections, so prefetch-distance verification used the top-level page.
- The 390 by 844 mobile harness retained a 327 by 245 wrapper before and after loading. Its 375px content width equalled scrollWidth, and all three artwork images decoded. Normal Music navigation revealed the complete composition.
- Desktop user-initiated playback advanced to 14.999649 seconds and completed at 30.019002 seconds. Scrolling home and returning did not unmount the artwork; one persistent audio element remained. Mobile Next record selected track index 1 and completed its preview.
- Temporary source-only Resource Timing and mount-lifetime console probes were removed. Final-source direct `#records` navigation loaded cached artwork successfully.

The SSR regression retains ten labelled choices and one dormant audio element while excluding turntable image URLs from initial markup. This is a scoped performance check, not a complete daily visitor audit or measured field-LCP improvement. Reduced-motion CSS, image-failure visibility and the component's missing-IntersectionObserver branch are source-reviewed; browser capability/network emulation, physical iOS, Safari and corporate-network testing were not performed. No production delivery was changed by this work.
