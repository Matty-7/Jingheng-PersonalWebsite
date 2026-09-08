# Visitor audit checklist

The parent performs these checks, then gives observations to separate critic/editor/reviewer agents. Jingheng authorized browser QA in the September 8 workflow redesign. Static source inspection or HTTP 200 does not substitute for these interactions. Do not change the checklist merely because a test fails or a capability is unavailable.

## Establish the source and environment

Verify the exact deployed source through the saved version, terminal deployment ID and corresponding PR receipt. Use a clean checkout of that source and current Sites building/hosting and control-browser skills. Root alone starts the supported Sites preview. Follow the preview troubleshooting skill's bounded startup attempts; use Vite with the vinext plugin, not the legacy vinext dev CLI.

Browser navigation is limited to the supported internal preview origin, never the public Sites URL. Production delivery is checked separately by HTTP. When the browser has no resize API, the development-only Vite middleware provides `/__audit/desktop`, `/__audit/mobile` and `/__audit/short`. Each embeds the unmodified homepage in an iframe with a real CSS viewport. Use the supported frame locator and ordinary clicks/scrolling. Read the iframe document's innerWidth/innerHeight to verify dimensions. These are Chrome responsive-layout tests, not Safari, device emulation, touch hardware or a corporate-network reproduction. The harness is apply:serve only; it must never become a production route.

Do not inject application state or use unsupported CDP, browser network interception or evaluation mutations. Discover actual DOM and locators before interacting. Preserve screenshot evidence when supported, with source, viewport and action context; never invent screenshot filenames.

## Essential checks at 1440 by 900 and 390 by 844

| Area | Actual visitor actions and pass evidence |
| --- | --- |
| Layout | Scroll normally through all sections. No horizontal document overflow, clipped navigation or inaccessible content. Capture top, collections and footer views. |
| Images | Scroll lazy images into view. Inspect complete/naturalWidth and rendered geometry; all selected images decode. Inspect inline JH, hero, turntable and terminal. CSS background HTTP success alone is not visual proof. |
| Films | Reach all ten films using normal scrolling; inspect visible titles and loaded posters. |
| Books | Select each of ten covers with normal controls; title and author match the selected book. Check keyboard focus on a representative control. |
| Broadway | Five Playbills initially form a fan with none extracted. Select each, verify front card and title, click outside to dismiss; also test Escape. |
| Music | Ten tracks are available. Start one real preview with its play control, observe currentTime advance, pause and observe it stop and the tonearm state change. Record media progress, not a claim to have heard sound. An unavailable external stream is PARTIAL with the failing URL/status if exposed, not a fake audio pass. |
| Channels | Check YouTube/Podcast link destinations without posting or subscribing. Newsletters opens the internal archive when newsletterUrl is null. Open a published article, then return. Do not invent a Substack URL. |
| Motion | Hero pause stops its name/scene loop; desk pause stops market animation. Preserve readable static fallback. |

Run one focused scenario in addition: short desktop 1280 by 720 bookshelf, then reduced-motion preference or a deliberately unavailable background if supported browser capabilities allow it. If capability is unavailable, record the omission, use the short-desktop scenario for useful coverage, and do not claim preference/network emulation. Missing essential coverage always makes the run PARTIAL/BLOCKED; optional scenario omissions remain explicit.

## HTTP and source checks

Run `node scripts/check_delivery.mjs https://www.jinghenghuan.com` against the exact deployed checkout. It inventories source-referenced local images and verifies HTTP status, MIME and exact bytes. It cannot prove browser decoding or company-network access. Check `source_dirty`; explain any difference from the reported SHA. Run `node scripts/check-seo.mjs https://www.jinghenghuan.com` for HTML metadata, archive/article delivery, robots, sitemap and unpublished-page protection. Publication unit tests cover the shared visibility filter, not end-to-end RSS delivery; inspect feed.xml separately.

Before any substantive PR merge run lint, TypeScript, npm test, check-content and production build, then wait for Site checks CI on the exact reviewed head. Re-run affected browser scenarios after a UI repair. A source diff invalidates previous review.

## Durable result

Append a marked block to the corresponding deployed PR body, preserving its receipts and other content. Re-read immediately before writing to avoid clobbering another writer. For repeated delivery of the same date/source, the non-overwriting branch claim is the owner guard. Future dates may audit the same source again.

Record:

- Audit date/time in America/New_York, full deployed/base SHA, branch and inspected head/tree/dirty state.
- Verified version/deployment IDs and terminal result, production URL and actual internal browser route.
- Actual viewport sizes, actions performed, observations and existing screenshot references.
- HTTP report totals and failures, independently from browser results.
- Stable finding keys, critic evidence, editor accept/reject/defer and reasons.
- One of COMPLETE_NO_CHANGE, FINDINGS, PARTIAL, BLOCKED or WAITING_FOR_DEPLOYMENT, plus exact omissions and next check.
- If repaired: PR link, exact-head reviewer result, critic closure, CI and merge outcome.

COMPLETE_NO_CHANGE requires every essential check to complete without an accepted issue. PARTIAL means some checks completed but required coverage is missing. BLOCKED means essential inspection could not start. WAITING_FOR_DEPLOYMENT means an active publication is still pending. For failed/missed publication use the shared bounded recovery in agent_workflow.md; never wait forever on an unowned terminal failure. Do not label a known reproducible defect NO_CHANGE just because no fix is accepted; record FINDINGS and the defer reason.

Do not send repetitive success/no-change notifications. Report a new or persistent blocker and what actually failed. Neither no change nor a failed tool disables these persistent tasks; future scheduled/event runs remain enabled.
