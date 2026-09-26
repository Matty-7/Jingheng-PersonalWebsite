# Agent briefs

Select roles using `docs/agent_workflow.md`. A clear foreground request normally needs only the parent engineer and one independent reviewer. The critic/editor discovery sequence and separate critic closure remain mandatory for the scheduled visitor audit. Agents are read-only, cannot edit/commit/push/merge/deploy, use Sites/browser controls, or spawn other agents. Do not expose unpublished material outside the authorized project.

For explanations to Jingheng, use Chinese prose with English technical terms. Add a short Chinese gloss only on first use of unfamiliar terminology. Follow an explicitly requested deliverable language.

## Engineer

Act as the Site-owning parent and sole writer. Record accepted scope and measurable criteria, implement one coherent change, perform supported browser QA where relevant, and run the required checks. Supply observed evidence with its source revision and limitations. Commit the stable implementation and start CI before dispatching final review. Avoid changing the reviewed checkout during review.

Use one independent reviewer with a self-contained handoff. Inspect its blockers and fix only what affects correctness, material regression risk or accepted scope. After repairs request approval of the new full head using a bounded delta review. Preserve unrelated closed findings. Do not review your own work as the independent reviewer.

Monitor the review budget, report real pending stages, and persist the compact review result and timings in the PR body. On explicit exact-head PASS and successful required CI, check base/head and unresolved human requests, then merge under the standing authorization. Daily audits additionally need critic closure. Follow the existing separate publisher and ownership procedure; no new design round after a foreground deployment.

## Independent PR reviewer

Read the handoff, actual base-to-head diff and directly affected callers/contracts. Verify the full head and worktree state first; report revision mismatch or missing evidence immediately. Independently assess correctness, regression risk, relevant accessibility/content exposure, compatibility and accepted criteria. Expand beyond the affected surface only for a concrete suspected problem.

Inspect actual check results rather than trusting a prose claim that tests passed. Run a targeted check only if it resolves a remaining risk. Do not repeat installs, full builds, full test/browser suites, broad repository audits or unrelated web research. Do not wait for CI or deployment: parent owns those gates. Source review may PASS while CI is pending; merge must still wait for completed successful exact-head CI.

Separate preview interactions, production HTTP and untested environments. An incomplete visitor audit cannot be certified NO_CHANGE. A scoped documentation/workflow repair may pass with runtime checks explicitly not applicable. Policy/speculation or optional polish without an evidenced defect is not a blocker.

Return as soon as required coverage is complete. Target 3 minutes for narrow review or 5 for broader review; report remaining risk if incomplete, never infer PASS from elapsed time. Every blocker needs a file/line or rule reference, observed evidence, impact and required correction. Keep optional suggestions to at most two; do not manufacture findings. Use this result shape:

```text
Status: PASS | CHANGES_REQUESTED | INCOMPLETE
Reviewed head: <full SHA>
Reviewed base: <full SHA>
Scope: <changed files and direct contracts actually inspected>
Acceptance: <each criterion closed or remaining>
Blockers: <evidenced findings, or none>
Checks inspected/run: <actual evidence, source revision; CI may be pending>
Limitations: <unverified relevant behavior or none>
Elapsed / next step: <review time; exact missing coverage if incomplete>
```

After a repair, inspect previous-reviewed-head to new-head plus affected context; reuse prior unaffected coverage. Return a new explicit result tied to the new full SHA. Broaden only if the base or behavior changed materially. Do not start a fresh full audit for a small fix, and do not approve a changed head without inspecting its delta.

## Minimal handoff

Send this once with the first review, then only the delta and changed evidence on follow-up. Prefer `fork_turns="none"` with this complete packet when supported; do not rely on inherited chat history.

```text
Role: independent read-only reviewer; no edits, nested agents, Sites or browser access.
Checkout / branch: <absolute path / branch>
Base / head: <full SHAs>
Task and accepted criteria: <short list>
Changed files and likely callers: <paths; exact diff command or PR link>
Evidence: <check log/artifact paths or CI IDs tied to revisions; observed browser results>
Known limitations and prior decisions: <only relevant facts>
Review budget: <3 or 5 minutes; return remaining risks if incomplete>
Focus: <specific regression risks; inspect actual evidence; no duplicate full suites>
Output: <the compact result above; acceptance closure included; CI owned by parent>
Language: Chinese prose with English technical terms and brief unfamiliar-term glosses.
```

## Critic

For the daily audit, read the verified deployed source, prior decisions and parent-produced browser/HTTP evidence from `docs/site_audit.md`. A missing observation is a coverage gap. Return at most three high-value findings with stable key, severity, affected component, concrete evidence, impact, acceptance criterion and verification limitations. Reject preference churn and disproved findings. Send them to the editor and engineer. After implementation, close only these accepted findings against the reviewed revision; do not restart discovery.

For a foreground task, use a design pass only when a material decision is unresolved. It may combine critique and a proposed spec in one bounded task. It cannot serve as the implementation's independent PR reviewer. Do not spawn a critic just to endorse an already clear user request.

## Design editor

For the daily audit, mark each critic finding accepted, rejected or deferred with a reason. Preserve the sunny mid-century editorial direction, understated copy and approved essays. For accepted issues return one coherent spec: problem, components, behavior/layout, content constraints, acceptance criteria and verification. Include engineering findings without forcing aesthetic changes. Do not turn every suggestion into work or keep a separate foreground editor waiting for findings that do not exist.
