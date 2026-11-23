# InspectSource — Development Log

This file is the current release/priority index. Detailed implementation notes are recorded in the dated `DEVELOPMENT_LOG_YYYY-MM-DD_*.md` files. Preserve earlier logs.

## November 23, 2026 — demo-only P0 regression work

- **PR #421 — Client Inspection history normalization** merged into `main` at `a28c6a0f0077f11b9063edb525b7074272513a46`. Absent/malformed legacy browser snapshots now normalize to seven fictional records, while valid synthetic filters remain restorable. Exact-head Validate application, Autonomous QA and Vercel Preview passed. Exact-main production Vercel READY and [smoke run 45153662414](https://github.com/jrbatek/vendor-inspector-marketplace/actions/runs/45153662414) passed. See `DEVELOPMENT_LOG_2026-11-23_CLIENT_HISTORY_STATE.md`.
- **PR #422 — Mobile Analytics Independent first-click diagnostics** merged at `fcbd1a526b55c9c392e28c116b5654135b59190c`. Fresh 390px and 320px hosted Chromium/Firefox documents check Independent/Agency/All (15/45/60 fictional records), focus and hit targets, page errors and transient recovery panels. Both mandatory exact-head workflows and Preview passed; production Vercel READY and [smoke run 45154626385](https://github.com/jrbatek/vendor-inspector-marketplace/actions/runs/45154626385) passed. See `DEVELOPMENT_LOG_2026-11-23_ANALYTICS_MOBILE_FIRST_CLICK.md`.
- **PR #423 — Real browser legacy-history regression** adds an independent Chromium Back/Forward exercise for invalid saved stage/sort versus valid synthetic Kickoff filters. See `DEVELOPMENT_LOG_2026-11-23_CLIENT_MALFORMED_HISTORY_BROWSER.md`. Its own CI, preview and production gates must be met before reporting release.

## Outstanding priority / safety boundaries

- **#321** intermittent browser Back/Forward and deep-link restoration: still OPEN, because one successful mitigation or test does not establish causal elimination of the intermittent failure.
- **#154** intermittent graphical-browser Independent Source Type crash: still OPEN until a reproducible client stack and causal fix are verified. Hosted regression coverage has grown, but lack of reproduction does not prove resolution.
- **Review-gated:** PR #288 (live anonymous access), #360 (demo/live provenance), #56 (production write rules). Do not autonomously merge live auth/RLS/privacy, banking/payments, external credentials or production matching changes.
- **Public Client Demo:** retain seven clearly labeled synthetic active inspections, working details/milestones/reports/NCR/actions/filtering, persistent one-page sidebar, and no-login routing. Never seed fictitious records into the production database.
- **Release gates:** local checks when available or GitHub-hosted CI (tests, synthetic, migrations, typecheck, production build, Chromium), both mandatory workflows SUCCESS, exact-head Vercel Preview READY, sequential merge, exact-main production READY and smoke PASS. Do not use Vercel pushes as debugging.

The recurring owner-approved development automation remains enabled. No schedule or authorization changes are made by these demo-only PRs.
