# Mortgage Map learning redesign

Accepted by Jingheng on September 27, 2026: visual option 3, a local learning tree above a focused interaction; recommended routes with free jumps. Preserve the complete existing catalog and verified references. No pricing, forecasts, market data or loan-pool simulation.

Acceptance: at most six nearby nodes on desktop; no initial settings, view tabs, link lists or encyclopedic counters; a working refinancing-rate illustration and answer feedback; all concepts discoverable; persistent understood state; detours preserve the original study position; existing concept links and browser navigation work; keyboard, reduced motion and narrow layouts remain usable. Progress records self-assessed understanding, not certified mastery. No login or network storage.

The illustrated borrower route starts at refinancing incentive, with fundamentals visible alongside it. Completing that route returns to any skipped fundamentals. All other concepts use the existing authored question and answer as a reflective exercise. Detailed summaries, formulas, sources and related reading are disclosed in place. The catalog keeps all ten domains and the existing cross-domain learning routes; its lines express study order, not a causal or prerequisite claim.

The mock’s example completion marks are not pre-populated in a new browser. Mobile uses a compact two-column local tree and normal vertical scrolling; it never shrinks desktop text or captures wheel input. Legacy graph and comparison modules remain isolated from the learning entrypoint for a later scoped cleanup; they are not shown as competing modes.

## September 27 simplification

Jingheng requested removing “Learn from here”, “Back to your learning path” and “View full tree”, and replacing every written-response exercise with multiple choice. This supersedes the detour and reflective-exercise behavior above.

Clicking any concept now adopts it as the saved learning position. The current route is retained when it includes that concept; otherwise the concept’s topic supplies the route. Browser back/forward restores the lesson and route without clearing understood concepts. All topics and search remain the single catalog entry points.

All 228 authored questions receive three distinct answer choices and one correct choice. Selecting an answer shows the existing explanation; a correct answer enables explicit completion. Original summaries, formulas and source links remain available under Why it matters. The footer contains only the current activity’s primary action. Verification covers complete question coverage, route persistence, browser history, incorrect/correct feedback, keyboard focus, and narrow layouts.

## September 27: research cases and stable lesson rendering

Accepted scope: add the reviewed educational gaps and four public research cases, and remove visible intermediate states during lesson changes and refresh. Keep the single local tree and three-choice interaction.

- The catalog now contains 229 concepts. Loan state transitions connects payment status, cures, exits and recovery timing. Existing lessons distinguish fixed-price from fixed-yield experiments, contractual/scenario/expected cash flows, origination/current DSCR, and executed/indicative/evaluated/executable prices.
- Four original case questions connect SFA's September second-lien research, Apollo's September 25 and 26 discussions, and Fannie Mae's public credit-score disclosure update to existing lessons. Dated sources stay inside the existing disclosure. No employer help pages, screenshots, private newsletters or vendor implementation details are published.
- Lesson changes retain the stage and heading DOM. Only exercise state and the optional disclosure reset. Tree connections are measured in a layout effect, before painting the new node positions.
- A validated `concept` query and a bounded position cookie let the server render the chosen lesson on refresh and return visits. The cookie contains only route/concept identifiers; completed lessons remain in browser storage. Old hash links remain supported, with a pre-hydration guard against displaying the wrong server lesson. The browser store uses `useSyncExternalStore` to synchronize history and saved progress without a deferred default-lesson render.
- The document background matches the learning page. Browser regressions check stable stage/heading identity, cleared answers, focus and correct server-rendered content with JavaScript disabled; existing history and catalog tests remain in the full CI matrix.
