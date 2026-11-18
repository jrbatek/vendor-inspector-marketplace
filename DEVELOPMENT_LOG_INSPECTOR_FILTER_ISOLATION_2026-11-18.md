# InspectSource development update — 2026-11-18 · Assignment-specific action filters

## Demo-only UX bug
- Switching directly from one open fictional inspector assignment to a different assignment by clicking a Calendar event previously retained the first project's Overdue/Upcoming action filter, because React reused the same mounted detail component.
- Key the detail workspace by the active project so an Open Assignment transition starts with that project's full actions. Calendar selections and events remain mounted and unchanged.
- Extend hosted Chromium smoke: filter LNG actions to Overdue, click Orion's assigned Calendar event without closing the first detail, verify Orion opens with All actions selected and both outstanding actions visible.

## Scope and safeguards
- Synthetic InspectorHub navigation only; no production records, login, private event titles, commercial rate, migrations or matching logic are modified.
- Require application validation, synthetic/migration/typecheck/build/browser checks, exact-head Vercel Preview READY before merge and production READY/smoke after.
