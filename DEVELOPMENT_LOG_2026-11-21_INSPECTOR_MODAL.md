# InspectSource development log — 2026-11-21 — InspectorHub short-screen opportunity actions

**Priority:** P0-B, all interactive controls reachable and legible.

The synthetic Opportunity Preview dialog previously had unrestricted height and a width that could overflow the padded backdrop at narrow viewports. On short mobile and landscape screens its Accept / Request more information / Decline controls could become unreachable.

Changes:
- Constrain modal width to its padded layout and height to the dynamic viewport while preserving the 44px close target and keyboard-accessible dialog.
- Make the modal internally scrollable with scroll containment so bottom actions remain reachable at 390×640 and 320×400.
- Add source-level regression and real Chromium mobile-viewport assertions in the InspectorHub smoke workflow.
- No changes to live authentication, RLS, PII, payment/banking, migrations, production matching, or database fixtures.

**Release checks:** Mandatory TypeScript, tests, synthetic corpus, migration checks, production build, Chromium smoke and Vercel preview READY before merge. Confirm exact-commit Vercel production READY and smoke afterward. Do not merge on pending/failed/action-required checks.
