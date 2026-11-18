# InspectSource development log — 2026-11-18 — Live InspectorHub demo-banner separation

Priority: P0-A, demo/live routing correctness. The global demo-route predicate
was incorrectly treating `/inspectorhub` as a permanently synthetic route even
though signed-in InspectorHub loads scoped live activity. That caused a false
"Demo Mode" banner and remapped the authenticated InspectorHub global menu back
into fictional demo pages.

Change: exclude `/inspectorhub` from unconditional synthetic-only demo paths,
while keeping `/demo/inspector` and `/demo-showcase` explicitly synthetic.
Do not change the existing anonymous InspectorHub sample preview or its
write-blocking behavior; do not change authentication, authorization or RLS.

Validation: added regression coverage for the live/demo predicate, banner,
global menu routing and unchanged live-data scope. Full test, synthetic data,
migration, typecheck, production build and Chromium QA must pass on the exact
PR head before release; Vercel preview and production READY required.

Related owner-approved work: retain seven synthetic Client Demo in-progress
inspections, report downloads, milestones, NCRs, filters and no-login entry.
These are unchanged by this narrowly scoped navigation fix.
