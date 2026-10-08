# Saved learning progress

The map saves understood concepts, the last lesson and route, and the latest answer to each unchanged question. Anonymous visitors use an unguessable, HttpOnly, Secure-on-HTTPS, SameSite cookie. The cookie identifies a server-side D1 record; clearing it loses anonymous access. Optional dispatch-owned ChatGPT sign-in associates progress with the platform's stable per-Site user ID and enables the same account to resume on another device. Email and name are not stored.

The API chooses ownership server-side and rejects cross-origin writes. The client sends its expected profile identifier so an account change cannot redirect queued updates into another account. Completion updates are additive and answers are versioned against the current question and choices. Question changes hide stale answers without deleting understood status. Position is last saved, not a total order of activity across devices.

The previous browser-only record migrates automatically. Browser storage now contains a recovery cache and unsent updates, not the authoritative saved record. Writes are serialized, with a visible saved/saving/error status, manual retry and retry on reconnect. An unavailable server never reports a successful save. Private browsing or blocked browser storage can limit recovery of unsent updates after closing a tab.

Signing in merges this browser's anonymous completions into the account, retaining an existing account position. A different account does not receive a previous signed-in account's cached work. Guest progress is cleared from the server only after its atomic merge into the account.

`db/schema.ts` defines the D1 tables. Drizzle migrations are schema-only and append-only after publication. `npm run db:migrate:local` prepares the built preview database; the complete browser suite runs it before starting its Worker. Sites applies production migrations during publishing.

Verification covers persistence across fresh clients, visitor/account isolation, guest-to-account migration, concurrent completion writes, invalid/stale inputs and storage failure. Browser cases cover restoring after cache deletion, pending saves across reload and legacy migration. Real hosted ChatGPT authentication is handled by the platform; preview and CI do not reproduce that external sign-in flow.
