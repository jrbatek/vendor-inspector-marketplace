# InspectSource development log — November 21, 2026 — Agency contract action states

P0-B, synthetic Agency Demo only. Contract details disclose aria-controls only while the matching panel exists, avoiding dangling references when collapsed. Primary agreement actions now have 44px minimum height. Generated fictional contract PDF feedback is attached to its individual agreement card with success/error live announcements; choosing a different contract clears stale feedback. No new real data, acceptance, credentials, payment or production integration.

Regression: tests/agencyContractActionStatesNov21.test.ts plus mandatory hosted Chromium smoke-agency-commercials coverage for three fictional agreements, mutually exclusive detail panels, browser PDF download, per-contract status isolation and 390px mobile control geometry. Do not merge without successful application validation, synthetic and migration checks, TypeScript, build, real browser smoke, READY exact-head preview. After merge require production READY and exact-commit smoke.

Existing P0 demo/live isolation and seven fictional Client Inspections in Progress remain unchanged. Open issues #154 and #321 remain independent. No synthetic database seeding.
