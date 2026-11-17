# InspectSource development log — 2026-11-17 (inspection delivery-stage sort)

- Priority: P0 Client Demo Inspections in Progress (seven synthetic inspections; authenticated live workspace remains isolated).
- Found that the `Delivery stage` sort button was a no-op in `sortActiveInspections` when data was not already in lifecycle order. It returned the source array unchanged, which would break as soon as a filtered or reordered source cohort was supplied.
- Fixed the demo-local sorting function with an explicit lifecycle order (Kickoff, Document review, Fabrication, Witness testing, NCR follow-up, Report review, Release preparation), stable tie-breaking by stage/start/ID, and unknown future stages at the end.
- Added unit regression with deliberately reversed fixture order, an unknown stage and an immutability assertion. Existing seven synthetic records, filters, open details, milestone and PDF/NCR functionality are not changed. No live authentication, RLS, payment, privacy, banking, matching rules or database writes.
- Validation/release gate: GitHub-hosted Validate application + Autonomous QA (unit tests, migrations, synthetic fixture QA, typecheck, build, browser smoke); require exact-head Vercel Preview READY before autonomous merge, then production READY and smoke verification. Container checkout unavailable due to GitHub DNS; no claim of local validation.
