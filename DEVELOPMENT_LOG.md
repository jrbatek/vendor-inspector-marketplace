# InspectSource — Development Log

This file is the current release/priority index. Detailed implementation notes are recorded in the dated `DEVELOPMENT_LOG_YYYY-MM-DD_*.md` files. Preserve earlier logs.

## November 23, 2026 — demo-only P0 regression work

- **PR #421 — Client Inspection history normalization** merged into `main` at `a28c6a0f0077f11b9063edb525b7074272513a46`. Absent/malformed legacy browser snapshots now normalize to seven fictional records, while valid synthetic filters remain restorable. Exact-head Validate application, Autonomous QA and Vercel Preview passed. Exact-main production Vercel READY and [smoke run 45153662414](https://github.com/jrbatek/vendor-inspector-marketplace/actions/runs/45153662414) passed. See `DEVELOPMENT_LOG_2026-11-23_CLIENT_HISTORY_STATE.md`.
- **PR #422 — Mobile Analytics Independent first-click diagnostics** merged at `fcbd1a526b55c9c392e28c116b5654135b59190c`. Fresh 390px and 320px hosted Chromium/Firefox documents check Independent/Agency/All (15/45/60 fictional records), focus and hit targets, page errors and transient recovery panels. Both mandatory exact-head workflows and Preview passed; production Vercel READY and [smoke run 45154626385](https://github.com/jrbatek/vendor-inspector-marketplace/actions/runs/45154626385) passed. See `DEVELOPMENT_LOG_2026-11-23_ANALYTICS_MOBILE_FIRST_CLICK.md`.
- **PR #423 — Real browser legacy-history regression** merged at `356780e8d19634c83be5f1d7eb2687214a68252d` after both exact-head CI checks and Vercel Preview READY. An independent Chromium page exercises malformed saved stage/sort and valid fictional Kickoff via actual Back/Forward without entering live Login. Vercel production READY verified; exact-main smoke must be checked separately. See `DEVELOPMENT_LOG_2026-11-23_CLIENT_MALFORMED_HISTORY_BROWSER.md`.
- **Back-to-top keyboard/history follow-on**: guard the shared demo-only floating button's pending settle timer against Tab/Enter/Escape, hash navigation and browser Back/Forward. Real hosted Chromium desktop test prevents a late scroll snap after a new navigation gesture. See `DEVELOPMENT_LOG_2026-11-23_BACK_TO_TOP_NAVIGATION.md` (CI/Preview/production gated).

- **PR #425 — Client Analytics CSV download lifecycle** merged into main at `9cbdeba40bb16b454d25041ed7b698217db48a51` after corrected exact-head CI, Vercel Preview READY and a safe rebase onto #424. The fictional CSV export now attaches the transient anchor, lets the browser take the download, then revokes the Blob URL after a short delay. Exact-main production READY/smoke to be verified separately. See `DEVELOPMENT_LOG_2026-11-23_ANALYTICS_CSV_DOWNLOAD.md`.
- **Filtered CSV browser-content regression** adds hosted Chromium verification of actual downloaded fictional Completed rows, including expected filtered row count, rather than trusting the filename alone. See `DEVELOPMENT_LOG_2026-11-23_ANALYTICS_CSV_CONTENT.md`.

- **PR #426 — Completed Analytics CSV browser-content verification** merged into main at `031d285fd533eb2e9c864e26568344b17ffa8d75` after both exact-head Validate application and Autonomous QA succeeded, with Vercel Preview READY. Tests verify real downloaded fictional CSV bytes, filtered row count and Completed statuses. Production Vercel READY and exact-main smoke are separate gates. See `DEVELOPMENT_LOG_2026-11-23_ANALYTICS_CSV_CONTENT.md`.
- **P0-B Source of Inspectors channel-disabled contrast coverage**: extend real Chromium sourcing smoke to check selected agency, unselected independent and selected independent channel buttons in disabled states, not just source selector buttons. Native disabled semantics and computed WCAG AA text contrast are required in 390px mobile demo. No live matching or commercial changes. See `DEVELOPMENT_LOG_2026-11-23_SOURCING_DISABLED_STATES.md`.

- **PR #427 — Source of Inspectors channel disabled-state contrast** merged into main at `93983abb10bd7c7c3005e6c41da5da4158f97a04` after exact-head Validate application and Autonomous QA passed with Vercel Preview READY. 390px hosted Chromium verifies selected agency, unselected independent and selected independent button contrast and disabled semantics. Production Vercel READY and exact-commit smoke are separate checks. See `DEVELOPMENT_LOG_2026-11-23_SOURCING_DISABLED_STATES.md`.
- **Client Preview request → Candidate CV browser regression**: hosted Chromium at desktop/mobile verifies both Natural Language and Structured Selection show two fictional available Houston candidates; View CV expands, and sample PDF downloads with real PDF bytes. See `DEVELOPMENT_LOG_2026-11-23_CLIENT_PREVIEW_CANDIDATES_BROWSER.md`. CI/Preview/production-gated.

- **Calendar focus boundary follow-on:** prevent repeated keyboard boundary actions from stealing focus during later date-field edits; real browser regression for Month and List. See `DEVELOPMENT_LOG_2026-11-23_CALENDAR_FOCUS_BOUNDARY.md`. PR #429 merged at `3098cb09286879746daae48ee204d5896218dcda` after exact-head validation and Preview READY; production verification separate.

- **Active Assignment keyboard focus:** focus detail heading and restore originating card on explicit Back. See `DEVELOPMENT_LOG_2026-11-23_ASSIGNMENT_KEYBOARD_FOCUS.md`. Reconciled onto #429; exact-head validation required.

- **PR #435 — Client inspection filter focus** merged at `7b12998b618c65c1721250cab013603232765fc2` after exact-head Validate application, Autonomous QA and Vercel Preview READY; production verification separate. See `DEVELOPMENT_LOG_2026-11-24_CLIENT_INSPECTION_CHIP_FOCUS.md`.
- **Qualifications local sample focus**: see `DEVELOPMENT_LOG_2026-11-24_QUALIFICATION_SAMPLE_FOCUS.md`; exact-head hosted checks and Preview required.

- **PR #436 — Qualifications local sample focus** merged at `dc6249ba85ffc4094baf8a3195955a9d3d3237fc` after both exact-head CI workflows and Vercel Preview READY; production verification separate.
- **PR #430 — Active Assignment keyboard focus** merged at `34ed4f6356065d1ba113f2e1ac68482bc3bd1fe4` after both exact-head CI workflows passed and Vercel Preview READY. Production verification is separate. #431 and #432 reconciled onto this main; #432 had an obsolete source assertion for the old standalone return URL, corrected to require `#insights`. Both require fresh CI/Preview.
- **Work History filter keyboard recovery**: clearing a chip restores focus to its matching persistent filter, avoids duplicate live result announcements, and preserves other active criteria. See `DEVELOPMENT_LOG_2026-11-24_WORK_HISTORY_FILTER_FOCUS.md`. CI/Preview/production-gated.
- **PR #431 — Structured Candidate CV announcement** merged at `897066e0e427932060ddb9ac7ee6f429acfde68e` after exact-head Validate application, Autonomous QA and Vercel Preview READY; production verification separate. #432 and #433 reconciled against this main for fresh validation.
- **PR #432 — Selection Insights return navigation** merged at `a5b137b71df90d319dffdd9ca966495420df25b1` after both exact-head workflows and Vercel Preview READY. Production verification separate. Work History and Income CSV browser coverage require reconciliation and fresh validation.
- **PR #435 — Client inspection filter focus** merged at `7b12998b618c65c1721250cab013603232765fc2` after exact-head Validate application, Autonomous QA and Preview READY. Production verification separate. See `DEVELOPMENT_LOG_2026-11-24_CLIENT_INSPECTION_CHIP_FOCUS.md`.

- **PR #433 — Work History filter focus** merged at `7769d89e43f6ffe468312dedde171885def90250` after both required exact-head workflows and Preview READY; production verification separate. PR #434 reconciled onto this main for fresh validation.
- **Income CSV browser verification**: see `DEVELOPMENT_LOG_2026-11-24_INCOME_CSV_BROWSER.md`. CI/Preview/production gated.

- **PR #434 — Income CSV browser verification** merged at `67cddcb392efed3ccd21eda0ad65b4a6a304b3dd` after both exact-head workflows and Preview READY; production verification separate.
- **PR #438 — Restore keyboard focus in fictional Agency resource search**: see `DEVELOPMENT_LOG_2026-11-25_AGENCY_RESOURCE_FOCUS.md`; reconciled onto #434 for fresh checks.

## Outstanding priority / safety boundaries

- **#321** browser Back/Forward and deep-link restoration: CLOSED on November 23 after state-normalization and real Chromium Back/Forward coverage (#421/#423); preserve regression coverage and reopen on any reproduced recurrence.
- **#154** intermittent graphical-browser Independent Source Type crash: still OPEN until a reproducible client stack and causal fix are verified. Hosted regression coverage has grown, but lack of reproduction does not prove resolution.
- **Review-gated:** PR #288 (live anonymous access), #360 (demo/live provenance), #56 (production write rules). Do not autonomously merge live auth/RLS/privacy, banking/payments, external credentials or production matching changes.
- **Public Client Demo:** retain seven clearly labeled synthetic active inspections, working details/milestones/reports/NCR/actions/filtering, persistent one-page sidebar, and no-login routing. Never seed fictitious records into the production database.
- **Release gates:** local checks when available or GitHub-hosted CI (tests, synthetic, migrations, typecheck, production build, Chromium), both mandatory workflows SUCCESS, exact-head Vercel Preview READY, sequential merge, exact-main production READY and smoke PASS. Do not use Vercel pushes as debugging.

The recurring owner-approved development automation remains enabled. No schedule or authorization changes are made by these demo-only PRs.
