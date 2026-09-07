# Four-role development loop

The four-role review loop runs inside an active cloud Work task. These roles are bounded tasks with explicit handoffs. A separate GitHub merge-triggered Work automation handles deployment after review and merge; the review agents do not run continuously. Future PRs are not automatically merged.

| Role | Responsibility | Handoff |
| --- | --- | --- |
| Design critic | Inspect the current design and user brief; identify concrete issues and acceptance criteria. | Findings with severity and evidence to the design editor. |
| Design editor | Accept or challenge each critique, turn accepted points into layout, typography, asset and copy specifications. | An implementation-ready specification to the engineer. |
| Engineer | The Site-owning parent applies scoped changes, runs checks, pushes a branch, and opens or updates the PR. | Exact revision, diff and check results to the regression reviewer. |
| Regression reviewer | Independently inspect behavior, content exposure, links, metadata, mobile CSS and changed interactions. | Blocking findings to the engineer; passing evidence to the critic. |

The critic then checks whether the accepted design intent survived implementation. The engineer fixes blocking findings and the relevant role rechecks that correction. Stop when the agreed scope passes, or after two repair cycles if the remaining issue needs a user decision. Do not invent extra redesign work to keep the loop running.

Only the Site owner edits the checkout or uses Sites lifecycle tools. Other agents read scoped source or asset evidence and send messages; they must not change files, create Sites, push commits, publish, or spawn another agent. The owner integrates generated assets.

## Required evidence

Run lint, TypeScript, the publication-visibility tests, content validation and a production build. Check that all three collections still contain ten items. Verify actual preview metadata when a track changes. Check homepage anchors after removing sections. Journal drafts and future dates must stay out of public pages, RSS and sitemap, and no draft content may enter a client bundle.

Browser or visual interaction checks are performed when requested and supported. Static review and a successful build are not claims of browser testing. Describe any remaining verification limit in the PR.

Every review reports the revision reviewed, concrete findings, severity, evidence and whether it blocks the requested change. PR creation and independent review do not automatically authorize merging. Once a PR is merged into `main`, Jingheng's standing instruction authorizes immediate deployment without another publishing confirmation.

## Deployment after merge

The GitHub event trigger is `pull_request` with `only_on_merge: true` for `Matty-7/an-afternoon-uptown` (repository ID `1360490618`). The deployment task verifies that the merged PR targets `main`, then deploys the latest checked `main` to the existing public Sites project in `.openai/hosting.json`. It uses the existing domain, `https://jinghenghuan.com`. The Mac does not need to be running.

1. Fetch the current GitHub PR and `main` revision. Ignore unmerged PRs and other target branches. Treat duplicate or delayed events as wake-ups to reconcile the latest `main`, never as instructions to roll production back.
2. Verify the required checks against the source being deployed. If the exact merged revision lacks a completed passing CI run, run the required checks in the cloud checkout. Do not deploy a failing revision.
3. Use the Sites skills as the sole Site owner. Fetch the existing Site and its source, preserve the project identity, build the checked revision, push that exact source state, and save it as a Site version. Reuse an existing matching saved build when appropriate.
4. Recheck `main` before deployment and reconcile any newer merged revision. Skip an already deployed revision. Deploy the saved version and wait for terminal success or failure.
5. Report the live URL on success, or the concrete failure if recovery cannot finish. Do not ask for routine publishing confirmation, automatically merge another PR, or make unrelated content changes.

The event subscription belongs to Work Automations; `.github/workflows/site_checks.yml` supplies CI checks. A repository rename also requires verifying and, if needed, updating the event subscription so future merges continue to trigger it.
