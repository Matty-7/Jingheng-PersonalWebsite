# Website maintenance workflow

Jingheng authorized independent review, automatic merge and public deployment on September 7, 2026, and proactive browser inspection and this workflow redesign on September 8. Cloud tasks do not depend on his Mac. Task prompts are versioned in `docs/automation/`; installing them is a separate native automation action, not something GitHub CI does.

## Two independent triggers

| Task | Trigger | Responsibility |
| --- | --- | --- |
| Publisher | A merged GitHub PR | Deploy latest checked main, verify delivery and record the exact receipt. No new design cycle. |
| Visitor audit | Daily, America/New_York | Inspect the verified deployment and its source in a browser preview. Submit at most one worthwhile reviewed improvement. |

Merge-only triggering is not continuous monitoring. Daily inspection runs even when source is unchanged. NO_CHANGE ends that day's inspection, not the schedule. Both tasks remain enabled after success, duplicate events, no change or failure unless Jingheng explicitly asks otherwise. Do not create replacement tasks from a scheduled invocation.

Repository: `Matty-7/an-afternoon-uptown`, ID `1360490618`. Resolve renames by this ID. Site: `appgprj_6a9ef28d91308191895df3c89d49f8d0`. Verify `.openai/hosting.json` with native Sites get_site; preserve `https://jinghenghuan.com` and its public audience. Never create another Site or change access controls.

## Publisher

Read every event and its actual PR with GitHub; handle merged PRs targeting main only. Events are wake-ups, not permission to deploy an old revision. Read latest main, recent PR receipts, saved versions and deployments. Verify receipt IDs with Sites. Observe matching pending deployments and reuse matching succeeded deployments or archive-backed versions instead of duplicating them.

When exact-source passing evidence is missing, run all checks below. `fetch_commit_workflow_runs` only lists PR-triggered runs; an empty result for a merge SHA does not prove failure. Follow current Sites building/hosting skills and supported scripts. Push exact checked source with a short-lived per-command credential, then read full git rev-parse HEAD; package and save that same revision. Recheck main, Site source and pending deployments before publishing. Never force overwrite newer source or production.

Deploy a saved version, poll its exact returned deployment ID to terminal status, and append source SHA, version ID, deployment ID, status and returned URL in a marked deployment receipt in the corresponding merged PR body, preserving existing content. A saved version is not a deployment. Run `node scripts/check_delivery.mjs https://www.jinghenghuan.com` and `node scripts/check-seo.mjs https://www.jinghenghuan.com` from that exact source. Record HTTP failure separately from platform deployment success. End on unrecoverable failure with a concrete blocker and receipt. Do not start a design cycle.

## Dated visitor audit

1. Read latest main, merged PR receipts, Sites versions/status and prior audit decisions. Verify the exact deployed source. If main is newer or deployment is pending, record WAITING_FOR_DEPLOYMENT and leave publication to the publisher. Do not edit an obsolete base.
2. Check open optimization/audit PRs and iteration branches. An actively owned PR blocks competing work. Claim `auto/audit_YYYYMMDD_<full_deployed_sha>` with native GitHub non-overwriting create_branch, using the America/New_York date. Only its successful creator owns that audit. An existing branch means another invocation owns that day; never reset or delete it. Preserve historic `auto/optimize_<sha>` guards; they do not suppress a different dated audit. Do not seize abandoned work without evidence.
3. Parent runs `docs/site_audit.md` against that source: actual supported browser interactions and separate production HTTP checks. Record full source and any uncommitted harness changes. Follow bounded Sites startup recovery. Missing capabilities yield PARTIAL/BLOCKED, not fabricated tests or alternate browser-control methods.
4. Spawn a read-only critic and a separate read-only design editor. Give them actual observations, available screenshots, revision, prior decisions and scope. Critic returns at most three stable evidenced findings; editor accepts/rejects/defers each, including code-only issues. No accepted issue means no empty PR. Append the dated checkpoint to the deployed PR body and end; tomorrow checks again.
5. Implement at most one coherent accepted improvement on the owned branch. Parent alone writes source and uses GitHub/Sites/browser tools. Spawn a separate independent read-only PR reviewer on the actual full PR head. Agents may communicate, but cannot edit, commit, push, merge, deploy, use Sites/browser tools or spawn more agents.
6. Obtain exact-head reviewer PASS, critic closure and successful Site checks CI. Merge with full reviewed expected_head_sha, then end. Its merge event publishes. The audit must not also publish and race the publisher.

An incomplete inspection may produce an evidenced narrow repair PR, such as a broken preview command, but cannot certify the overall visitor experience. Preserve untested scenarios as follow-up checks; do not relax the checklist. After two unsuccessful repair/review passes, preserve a draft PR with blockers and end. Later tasks report rather than overwrite it.

## Evidence and merge gates

Run `npm run lint`, `npx tsc --noEmit`, `npm test`, `node scripts/check-content.mjs` and `npm run build` after substantive changes. Wait for completed successful Site checks CI on the reviewed full PR head. Preserve ten songs, ten films, ten books, five Playbills, actual user-initiated audio, normal scrolling, accessible controls and reduced-motion behavior. Keep drafts and future entries out of public routes, RSS, sitemap and client bundles. Preserve approved essays, paragraph order, metadata and personal facts.

PR body: accepted finding, editor decisions/spec, full base/head SHAs, independent reviewer result, critic closure, checks, runtime evidence and limitations. Source changes invalidate approval, including documentation changes to execution rules. Re-read the actual PR diff after repairs. Immediately before merge recheck base, PR head, CI and unresolved human change requests. If source changed, reconcile and revalidate/review it. Never forge another account's GitHub approval or treat an agent PASS as permission to bypass branch protection.

Do not invent essays, subscriptions, tracking, services, accounts, messages or a new style to manufacture work. Rejected preferences stay rejected unless new evidence or user direction changes them. No self-modification of automation gates during routine audits.

## Foreground ownership and reporting

A foreground engineer who directly owns deployment may temporarily pause the publisher, then restore it before handoff. Prefer the publisher after a normal foreground merge and do not race it. Check existing pending work before taking over failures.

Use the audit statuses and evidence template in `site_audit.md`. Report meaningful fixes, outages or persistent blockers concisely in Chinese, with live/PR links. Silence routine duplicate and complete-no-change notifications. Never call an untested or blocked run successful. Cloud inspection does not reproduce the owner's corporate network.
