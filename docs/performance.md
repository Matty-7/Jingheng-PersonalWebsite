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
