# Iteration speed

The September 26 measurements put browser execution on the critical path. In Site checks run 36279028842, TypeScript took 10 seconds and the production build 12 seconds. The quality job took 56 seconds including its 18-second dependency install. Browser installation took 35–46 seconds per shard; the three complete browser partitions took 140, 137 and 193 seconds. These are one-run observations, not service-level guarantees. Replacing Vinext or TypeScript is not justified by this evidence.

## Commands and evidence

- `npm run check`: lint, configured formatting, TypeScript, all Node tests and content checks with at most two child processes. Use for broad local changes; narrow edits can run only the relevant command.
- `npm run check:full`: the same checks, followed by one production build if they pass. CI's quality job uses this command. It does not include browser tests.
- `npm run review:packet -- <full-base-sha>`: produce a read-only reviewer handoff from a clean committed checkout. Add the accepted scope, criteria and current CI run ID before dispatch. The command identifies changed files and the exact diff; it does not approve anything or spawn agents.

Each quality run records individual logs, elapsed times and a machine-readable `outputs/checks/report.json`. The report is reset to an incomplete result before execution, so failure or interruption cannot expose a previous PASS. Reports made from dirty source or a different head/tree are not included in the reviewer packet. An unchanged checkout is not a reason to rerun complete checks that current-head CI already covers. Local evidence is never a substitute for required CI or independent review.

CI preserves the JSON browser report next to screenshots/traces and adds its ten slowest cases to the job summary. Use these measurements to distinguish installation, test execution, review and deployment. Browser durations include real animation timing where that timing is part of the behavior under test.

## Test boundaries

The Music suite is divided by behavior: selection/overview, playback, shelf motion and catalog/export. All fifteen original test bodies and all five browser projects are retained. Each test receives its own Playwright page; the shared shelf helper has no shared mutable state. File-level sharding can now distribute those groups without enabling full within-file parallelism, increasing worker pressure or cutting assertions.

Keep the full suite for application, test, dependency and workflow changes. The documentation allowlist, required aggregate gate, zero retries and review requirements remain authoritative in `docs/agent_workflow.md`. Do not infer application testing from the documentation fast route.

## Agent coordination

Use one reviewer for a stable foreground change and start it while CI runs. Prefer the generated packet plus short criteria to full conversation history. After a repair, pass only the old/new heads, actual delta and affected evidence to the same reviewer; it must explicitly approve the new full head. The parent owns CI, merge and publication waiting. Existing review budgets and INCOMPLETE handling continue to apply.

Avoid editing the same workflow in two active checkouts. Inspect open PRs first; independent work may proceed in its own branch, then integrate the completed change before final review. Do not take over another task's review or publisher claim merely because its work is taking time.
