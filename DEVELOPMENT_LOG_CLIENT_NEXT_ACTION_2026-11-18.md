# InspectSource development update — 2026-11-18 · Client next-action consistency

## Safe demo-only improvement
- Client inspection cards now identify the actual earliest outstanding action by date, not whichever action happens to be first in a fictional fixture.
- The filtered inspection CSV uses the same deterministic action selector, avoiding disagreement between the card, due-date sorting and export for multi-action inspections.
- Action-free records show "No outstanding actions" rather than rendering undefined text; CSV columns remain blank.
- Added unit/contract regressions covering out-of-order actions, same-day ties, empty action sets, stable source ordering, and CSV consistency.

## Safety and release
- No changes to live client authorization, inspector identities, production matching, payments, banking, migrations or persisted data.
- Synthetic fixtures are not seeded into production.
- Mandatory Validate application / Autonomous QA, Vercel Preview READY, then merge and production smoke required.
- Continue P0 demo/live isolation and control visibility, Calendar, assignment details, and unresolved Analytics crash; keep PR #288 and #56 review-gated.
