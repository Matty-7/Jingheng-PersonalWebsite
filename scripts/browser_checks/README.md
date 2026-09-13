# Mortgage focus regression

Every pull request and push to main runs this journey in the Site checks workflow.
It runs against that checkout’s production build in a local Wrangler server,
with independent Chromium contexts at desktop (1440×900), mobile CSS viewport
(390×844), and short desktop (1280×720). It never calls the live site or remote
services. A browser assertion or server-start failure fails the job. On failure,
GitHub retains the report, screenshot and trace for seven days.

## Local development or CI

```sh
npm ci
npx playwright install --with-deps chromium
npm run build
npm run test:browser
```

The runner owns port 4173 and refuses to reuse an existing server. Stop other
servers on that port first. Playwright closes its contexts and local server.
The test uses keyboard activation, retains traces only on failure and does not
retry failing tests automatically.

## Supported cloud preview

In the managed Sites environment, continue using the current control-browser
skill and supported Sites preview rather than launching another browser.
`mortgage_focus.mjs` retains its `check_mortgage_focus(tab, viewport)` entrypoint,
which wraps the same `check_mortgage_focus_surface` assertions as CI.

Open `/__audit/mortgage_desktop`, `/__audit/mortgage_mobile` or
`/__audit/mortgage_short` on the supported internal preview origin. Confirm the
map has loaded and search is ready. Load both exported functions from
`mortgage_focus.mjs` in the skill’s Node REPL with the Node assertion import;
call `await check_mortgage_focus(tab, 'desktop')` (or `mobile` / `short`). If the
browser runtime cannot access the checkout, read the script through the
executor and evaluate both functions in that same Node REPL, omitting `export`.
Do not start a different browser.

The journey resets to overview and checks retained reader content, stable exit
focus, restored body overflow, concept/history/section focus in normal and
expanded modes, keyboard containment, and staged Escape. Search results consume the first Escape without closing the
reader or expanded map; matching results, no results and an empty query are
covered in normal and expanded layouts. Focus must remain
on the expected control across several samples, so a delayed competing effect
cannot pass just by restoring focus momentarily. DOM evaluation is read-only.

These are Chromium layout and keyboard checks, not physical touch, Safari,
screen-reader, corporate-network or production-browser coverage. Record the
actual full source revision and run result in the PR. Running `--list` only
checks discovery and is not a browser test pass.
