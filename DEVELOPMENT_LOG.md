# InspectSource Development Log

This file is maintained by the autonomous development loop. Keep entries concise and factual.

## 2026-10-05 - Repaired final stale global-login regression contract
- Re-read the product roadmap and autonomous-development protocol and inspected open PRs and CI for PR #91.
- Confirmed the remaining failure was a stale `homeDemoUx.test.ts` expectation for separate Client/Inspector login links; the application uses the current one-global-Login model across Clients, Agencies, and Inspectors.
- Updated the regression contract to require all three marketplace audiences, one global `/login`, and rejection of role-specific login labels/URLs.
- No application behavior, auth/RLS policy, production data, payment/bank handling, matching/business rules, schema, credentials, or synthetic production records changed.
- Fresh CI was triggered by the commit; validation/deployment status remains pending and must pass before merge or promotion.

## 2026-09-13 - Deepened synthetic Billing & Payment workflow detail
- Audited the accelerated UX/demo backlog, roadmap/protocol, development log, recent commits/open PRs, GitHub CI, and Vercel production health. The major currently specified Client Demo, Inspector Demo, intake, analytics, client operations, navigation, accessibility, and demo/live isolation UX is already represented in the merged product.
- Found a remaining Billing & Payment completeness gap: the synthetic invoice experience showed balances/statuses/purchase orders but did not expose a full submission → authority check → approval → payment-history story, and expandable billing/contract rows did not explicitly connect their controls to detail regions.
- Expanded deterministic synthetic invoice records with submission history, approval history, payment history, fictional demo references, a computed approval-queue KPI, and an explicit synthetic approval-workflow summary. Added `aria-controls`/detail-region IDs to invoice and contract expanders and hid decorative expand/collapse glyphs from assistive technology.
- Validate application and Autonomous QA both passed regression/unit tests, migration safety, TypeScript, production build, route smoke tests, and deterministic synthetic-corpus QA. The PR #73 Vercel preview reached READY and `/demo/client-operations` returned HTTP 200 with the new workflow and accessibility relationships verified.
- PR #73 was squash-merged. The merged production deployment reached READY, production `/demo/client-operations` returned HTTP 200 with the expanded Billing & Payment experience, and Vercel reported no production runtime errors in the preceding 24 hours.
- No auth/RLS policy, production persistence, real billing/payment execution, payment credentials, API credentials, matching/business rules, schema, legal execution, privacy/PII handling, or production-data semantics changed. No synthetic records were seeded into production.
- PR #56 remains open for product-owner review because it changes production request persistence and is privacy/auth-adjacent.

### Product-owner review queue
- PR #56: review the proposed guard that prevents anonymous Find Inspectors searches from persisting request text while preserving authenticated client draft persistence.
