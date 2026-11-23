# InspectSource Development Log — 2026-11-23 · Real Chromium malformed history Back/Forward

## P0-A #321 follow-on
Add a separate clean Chromium page inside the existing mandatory Client Demo smoke. Navigate to seven fictional inspections, select one-row Kickoff, then emulate a legacy malformed history entry containing an unknown stage/sort while retaining Next framework state. Push a valid fictional Kickoff entry; real browser Back must clear invalid history and restore seven fictional inspections; Forward must restore the one-row Kickoff filter. Assert no login shell both ways. This directly covers the browser integration of safe snapshot normalization shipped in PR #421, rather than only its pure unit tests.

Keep #321 open: a single passing regression does not establish the original intermittent deep-link failure is fully eliminated. No live auth, RLS, payments, privacy, data seeding or matching changes. Exact-head CI, synthetic validation, migrations, TypeScript, production build and hosted Chromium plus Vercel Preview READY required before merge; production READY and smoke after.
