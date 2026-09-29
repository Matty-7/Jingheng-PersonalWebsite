# Home and Mortgage Map loading boundaries

The accepted scope is to reduce initial client work while preserving the existing content, visual layout, learning progress, history navigation and motion.

- The homepage is a Server Component. HomeHero owns shared name/room pause state; HomeMotion owns scroll/reveal effects. Records, books, playbills and the terminal remain independent client components.
- Mortgage navigation is a compact server projection. Shared learning rules consume that projection without importing the complete authored catalog in the browser.
- The first lesson is rendered on the server, including its one question, referenced sources and optional pre-rendered formula. Other lessons use `/api/mortgage-lesson`; the catalog search projection loads only when its dialog opens.
- Lesson loading deduplicates requests, caches successful results for the current visit and permits retries. Navigation commits its lesson, progress and user-initiated history update together. Failed or superseded requests preserve the displayed lesson. Completion remains tied to that lesson.
- Confirmed progress persists even while the next lesson loads or fails. A failed first restoration does not overwrite saved progress with the server fallback. The catalog search box keeps immediate keyboard focus while its data loads; results become actionable once available.
- Hover, focus and touch can prefetch a local tree lesson; at most two speculative requests are allowed. There is no background download of the complete lesson collection.
- KaTeX stays on the server. The API and SSR share the same lesson projection. Existing storage keys and authored content are unchanged.

The bundle check counts the union of every homepage client entry and its static dependencies, deduplicated. The Mortgage Map budget is reduced to 250,000 raw / 80,000 gzip bytes. These are JavaScript budgets, not total page transfer or field-performance measurements. Navigation metadata and current-lesson props also consume bytes; formula HTML for unrelated lessons is no longer sent.

Regression coverage includes catalog search parity, request deduplication, stale responses, failed loading and retry, durable completion and failed restoration, browser history, server-rendered saved lessons, stable lesson DOM and focus. Async browser checks wait for loaded results or committed navigation before measuring the same focus and animation requirements. Full browser validation remains in exact-head CI.
