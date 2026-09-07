# Autonomous website improvement loop

Jingheng authorized this workflow, including automatic merge and public deployment after independent review, on September 7, 2026. It runs in cloud Work tasks and does not require his Mac to remain awake.

## Roles and handoffs

| Role | Responsibility | Required output |
| --- | --- | --- |
| Critic | Inspect code and the current design for evidenced defects or worthwhile improvements. | Ranked findings with locations, impact, evidence and acceptance criteria. |
| Design editor | Accept, reject or defer each finding; weigh aesthetics and usability as well as engineering cost. | A small implementation spec and reasons for each decision. |
| Engineer | The Site-owning parent implements the accepted spec and opens a PR. | Scoped diff, checks and persistent review evidence. |
| PR reviewer | A separate agent independently reviews the exact PR revision for correctness, regressions and spec compliance. | Blocking findings or an explicit pass tied to the full head SHA. |

The concrete agent briefs are in `agent_roles.md`. The three read-only subagents may communicate directly; the parent remains the engineer and sole Site owner. Subagents must not edit the Site checkout, call Sites tools, push, merge, deploy, or spawn other agents. If independent agents are unavailable, do not represent the engineer's own review as independent approval.

The engineer addresses blocking findings and requests another review of the changed revision. The critic checks that the result satisfies the accepted intent. A passing reviewer, passing checks and critic closure authorize merge and deployment without asking Jingheng again. A new code commit invalidates the previous approval. Record any doc-only follow-up separately.

## Cloud event loop

One Work automation subscribes to GitHub `pull_request` events with `only_on_merge: true` for `Matty-7/an-afternoon-uptown` (repository ID `1360490618`). Each invocation does the following:

1. Read the actual event PR and current `main`. Ignore unmerged PRs and other target branches. Treat duplicate or delayed events as wake-ups to reconcile current state.
2. Deploy the newest checked merged `main` to the existing public Site in `.openai/hosting.json`, preserving `https://jinghenghuan.com`. Follow the Sites building and hosting skills: obtain source credentials, build, push exact source, save a version, deploy, and observe terminal status. Reuse matching builds and saved versions when appropriate.
3. Only after deployment succeeds, start the critic and design editor on that deployed revision. Inspect existing optimization branches and PRs before creating new work. Continue an existing incomplete iteration only when no other task owns it; otherwise leave it to that task.
4. For an accepted improvement, the engineer claims the deterministic branch `auto/optimize_<full_base_sha>` with GitHub's non-overwriting create-branch action. If it already exists, do not start another iteration from that base. Keep the branch as the durable iteration identity, even after merge.
5. Implement one coherent improvement, open the PR, obtain independent review and critic closure, then merge only the exact reviewed head with `expected_head_sha`. End this invocation after that merge. Its merge event starts the next invocation, which deploys it before starting another critique.

This divides the repeating loop into durable event-driven tasks instead of keeping one conversation running forever. It is not a polling schedule. When no worthwhile finding is accepted, end the iteration without an empty PR; the next merge wakes the workflow again. Do not invent a defect, relabel a rejected preference, or alternate between equivalent designs to manufacture another cycle.

The foreground task may perform a deployment and its first critique directly. While it owns that work, pause the event subscription, then re-enable it before the next autonomous PR merge. Do not leave the subscription paused at handoff.

## Evidence and merge gates

Run `npm run lint`, `npx tsc --noEmit`, `npm test`, `node scripts/check-content.mjs` and `npm run build` for substantive changes. Wait for the PR's `Site checks` CI to pass before merge. All three collections must retain ten items. Changed audio metadata must refer to actual previews. Removed sections must leave no broken homepage anchors. Journal drafts and future dates must stay out of public routes, RSS, sitemap and client bundles.

The review record in each PR body must include the critic's accepted finding, editor decisions and spec, full base and head SHAs, independent reviewer result, critic closure, check evidence, and any verification limitation. Update this record after a repair. Do not forge a GitHub approval from a different account or imply that an agent review satisfies an unmet repository branch-protection rule.

Inspect the latest base and PR head immediately before merge. If either changed after review, reconcile and review the resulting source before retrying. Honor unresolved human change requests. A failed or cancelled check is not a pass. Native merge must receive the reviewed `expected_head_sha`; never force push or bypass branch protection.

## Deployment and recovery

Use only the existing Site project from `.openai/hosting.json`; never create a replacement. Record the exact version ID, deployment ID, source SHA, terminal status and returned production URL in the deployed PR's body. That receipt allows the next invocation to avoid duplicate deployment. Verify receipt IDs with Sites before trusting them. A saved version alone is not a deployment.

Recheck current `main` and any existing deployment immediately before publishing. Never deploy an older event revision over a newer successful or ongoing deployment. If another task has advanced Site source, reconcile instead of force overwriting it. One invocation may produce at most one new optimization PR and merge; further iterations belong to the next event.

Fix routine failures within the accepted spec. After two unsuccessful repair/review cycles, preserve the draft PR and evidence, report the concrete blocker, and end that attempt. Do not repeatedly retry an unchanged failing revision. Platform denials must be respected and explained; do not modify approval policies or weaken checks to keep the loop moving.

Preserve owner-authored essays and personal facts. Do not add new articles, subscriptions, analytics, paid services, external messages or a new brand direction as automatic cleanup. Browser QA must be explicitly requested and supported; static review is not visual or interaction testing.

A repo rename requires verifying and, if needed, updating the Work event subscription. The GitHub Actions workflow supplies CI; the Work automation supplies the repeating multi-agent execution and publication.
