# Four-role development loop

This workflow runs inside an active cloud Work task. These are agent responsibilities and handoff rules, not persistent background processes. No scheduler, API key, external agent service, or automatic merge is configured.

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

Every review reports the revision reviewed, concrete findings, severity, evidence and whether it blocks the requested change. PR creation and independent review do not automatically authorize merging or publishing. Follow the user's current publishing instruction.
