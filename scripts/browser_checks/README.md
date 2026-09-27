# Site browser regression

Application changes run these journeys in the Site checks workflow on pull
requests and pushes to main. The documented non-runtime documentation
allowlist uses the fast CI route. Browser tests use the exact checkout's
production build in a local Wrangler server.

The suite covers Chromium at desktop (1440×900), mobile CSS viewport (390×844)
and short desktop (1280×720), plus WebKit at desktop and mobile CSS viewports.
The separate `mobile_device.spec.ts` runs with Pixel 7 and iPhone 13 device
emulation. CI distributes the suite across three shards with two workers each.

Record preview requests use a valid generated PCM WAV. Atlas map tests use a
local style fixture. These checks exercise browser behavior without depending
on live Apple audio or map tiles. A browser assertion or server-start failure
fails the job. GitHub retains `site-browser-evidence-1`,
`site-browser-evidence-2` and `site-browser-evidence-3` for seven days: reports
and attached screenshots, plus failure screenshots and traces.

## Local development or CI

```sh
npm ci
npx playwright install --with-deps chromium webkit
npm run build
npm run test:browser
```

The runner owns port 4173 and refuses to reuse an existing server. Stop other
servers on that port first. Playwright closes its contexts and local server.
Tests do not retry automatically. Foreground work should run focused local
checks and use exact-head CI for the complete required suite, as described in
`docs/agent_workflow.md`.

## Supported cloud preview

Use the supported Sites preview and browser tooling available in the session.
`mortgage_focus.mjs` retains its `check_mortgage_focus(tab, viewport)` entrypoint
for the internal `/__audit/mortgage_desktop`, `/__audit/mortgage_mobile` and
`/__audit/mortgage_short` preview wrappers. It calls the same
`check_mortgage_focus_surface` assertions used by CI.

The shared journey checks search dialog focus, no-result feedback, Escape
return focus, keyboard selection of SMM, lesson heading focus and All topics
dialog keyboard containment. It returns the viewport and individual results.

## Coverage

- Mortgage tests cover lessons, search, catalog navigation, history, focus and
  analytics. `mortgage_camera.spec.ts` now verifies the learning layout works
  without pan/zoom controls, fits narrow screens and restores the overview.
- Atlas tests cover unified search, markers, URL selection, redirects from old
  map routes, lazy details, caching, retry behavior, stale-response protection,
  mobile layout and music playback.
- `records.spec.ts` checks user-initiated playback, an advancing media clock,
  pause/resume, next/previous wrap, one audio element across sections and error
  recovery. Its generated audio does not verify Apple CDN availability.
- Bookshelf and device tests cover pointer reordering, keyboard activation,
  Escape restoration and emulated touch interactions.
- `home_layout.spec.ts` checks navigation and artwork visibility, collection
  counts, shelf rows and horizontal overflow, and attaches screenshots after
  fonts and images are ready with reduced motion.

Device emulation and WebKit checks are not physical-device, installed Safari,
screen-reader, corporate-network or production-browser coverage. Record the
actual full source revision and run result in the PR. Running `--list` checks
discovery only. New visual expectations require review against the actual
design; screenshots support diagnosis and never replace executed assertions.
