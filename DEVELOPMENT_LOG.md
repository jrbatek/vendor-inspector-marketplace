## 2026-11-06 - Income & Tax Center demo (branch pending release checks)
- Added isolated Inspector Demo /demo/inspector-income with fictional 2024-2026 earnings statements and independent-contractor/employee totals, fixed 2026 YTD snapshot through 2026-11-01T23:59:59-06:00, simulated work/income verification and historical 1099-NEC/W-2 informational summaries.
- Functional sample text downloads are explicitly labeled invalid for filing, credit or employment, while the payment-details demo changes only an in-page fictional preference and accepts no bank credentials.
- Linked it from Inspector Demo, extended synthetic-only contract tests and the local route smoke suite. No live payments, tax forms, payroll, authentication, RLS, privacy, production database or external integration changes.
- Feature is proposed in a PR and is not claimed deployed until GitHub-hosted validation, Vercel preview READY, merge and production READY smoke are confirmed.

## 2026-11-06 - Synthetic Work History consolidation (proposed branch)
- Added a dedicated Inspector Demo Work History workspace combining ten fictional completed assignments and associated submitted reports with client, industry, commodity, closeout status and inclusive completion-date filtering.
- Assignment details open in place; submitted reports use existing watermarked synthetic PDF endpoint for both viewing and downloading. Old /demo/inspector-reports links redirect to the consolidated workspace; redundant Inspector Demo Reports navigation removed.
- Added deterministic data/filter/PDF/navigation contract tests and local smoke route coverage. No auth, Supabase, external API, production record, bank or payment changes, and no synthetic database seed.
- GitHub-hosted validation, preview READY, and production release must be confirmed before merge; local container checkout is unavailable. This entry documents the proposed change, not a deployed feature.

## 2026-11-04 - Issue #100: usable active client inspection demo
- Added `/demo/client-inspections` with exactly seven separate synthetic active inspections, stage/project/inspector and inclusive schedule-range filters, empty/reset states, and expandable details.
- Details include client/project/vendor/site/contact, scope/PO, equipment, inspector, schedule, milestones, downloadable sample PDFs, NCRs, and actions with owners and due dates.
- Routed the client hub/sidebar to the active workspace and kept demo audience navigation and email guidance under `/demo/*`. Ordered global audiences Clients, Inspectors, Agencies.
- Unauthenticated live workspace visitors are redirected to Login before workspace content renders. Removed its obsolete History navigation and included historical records within Analytics; existing history deep links remain compatible.
- Added filter/data/navigation/contrast regressions and extended local smoke coverage to the demo routes and sample PDF endpoint.
- Pre-push validation: `npm run validate` passed all 136 tests (no failures/skips), 10-file migration safety scan, full synthetic QA corpus, TypeScript, production build, seven local routes, and a sample PDF request. `git diff --check` passed.
- Browser validation against the production build passed all seven stage/project/inspector choices, schedule boundaries, combined/empty/reset states, all seven detail panels and PDF downloads, demo navigation, unauthenticated live Login redirect, mobile layout, and computed control contrast of at least 4.5:1 in default/hover/keyboard-focus states; no page errors.
- Live Supabase credentials were not supplied; build/browser checks used the documented CI placeholders. GitHub API reads currently return `Forbidden`; PR creation and Vercel preview verification may require restored API access. This branch does not use the automatic-merge prefix and must remain reviewable, including the authentication redirect.

# InspectSource Development Log

This file is maintained by the autonomous development loop. Keep entries concise and factual.

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

## 2026-09-13 - Expanded production smoke QA across full synthetic demos
- Audited the accelerated UX/demo backlog, roadmap/protocol, development log, recent commits/open PRs, GitHub CI, and Vercel production health. The major currently specified Client Demo, Inspector Demo, client operations, analytics, intake, navigation, and demo/live isolation UX is already represented in the merged product.
- Found a remaining release-safety gap: the production smoke workflow only checked `/`, `/project-coordinator`, and `/inspectors`, so successful deployment did not continuously verify the separate Client Demo, Client Analytics, Inspection History, Client Operations, Data & Integrations, Inspector Demo, or demo-aware Email Requirements surfaces.
- Expanded production smoke coverage across `/demo/client`, `/demo/client-analytics`, `/demo/client-history`, `/demo/client-operations`, `/demo/client-data`, `/demo/inspector`, and `/email-requirements?demo=1`, with route-specific content markers and explicit `Demo Mode` boundary checks on server-rendered `/demo/*` pages. Added regression tests protecting the expanded runtime QA contract.
- The first production pass exposed two QA false-negative assumptions rather than application defects: raw HTML escapes ampersands in two human-readable markers, and `?demo=1` Email Requirements applies demo context after client hydration to preserve static prerendering. PRs #71 and #72 tightened the smoke contract to stable rendered markers and to server-rendered demo-boundary assertions while retaining Email Requirements route/content coverage and its existing application-level query-state regression protection.
- PRs #70, #71, and #72 were squash-merged after their required Validate application and Autonomous QA gates passed and Vercel previews reached READY. The final merged production smoke run passed the expanded route set; post-merge Validate application and Autonomous QA also passed. The final production deployment reached READY, and Vercel reported no production runtime errors in the preceding 24 hours.
- This cycle changed QA/test workflow coverage only. No application behavior, auth/RLS policy, production persistence, real billing/payment execution, API credentials, matching/business rules, schema, production-data semantics, or synthetic production records changed.
- PR #56 remains open for product-owner review because it changes production request persistence and is privacy/auth-adjacent.

### Product-owner review queue
- PR #56: review the proposed guard that prevents anonymous Find Inspectors searches from persisting request text while preserving authenticated client draft persistence.

## 2026-09-13 - Preserved Client Demo context through Email Requirements
- Audited the accelerated UX/demo backlog, roadmap/protocol, development log, recent GitHub/CI state, open PRs, and Vercel production health.
- Found a remaining demo/live isolation inconsistency: Client Demo intentionally linked to `/email-requirements?demo=1`, but the Email Requirements page rendered with live-workspace navigation and was not recognized by the global Demo Mode / authenticated `Demo view` labeling.
- Extended the demo-route classifier to recognize only the explicit `?demo=1` Email Requirements entry, retained the synthetic Client Workspace sidebar and added clear demo-only/no-production-persistence guidance. Ordinary `/email-requirements` remains a non-demo route and mailto behavior is unchanged.
- An initial `useSearchParams()` implementation correctly failed Vercel production-build prerendering across the shared layout. Replaced it with the existing client-side `window.location.search` synchronization pattern, preserving static prerendering. The next CI run exposed two stale regex-only regression expectations; those were tightened to the new query-aware demo contract rather than weakening coverage.
- Final Validate application and Autonomous QA both passed all 79 regression/unit tests, migration safety, deterministic synthetic-corpus QA, TypeScript, production build, and smoke routes. The final Vercel preview reached READY, PR #69 was squash-merged, and the production deployment reached READY. Production `/email-requirements?demo=1` returned HTTP 200 and Vercel reported no production runtime errors in the preceding 24 hours.
- No auth/RLS policy, production persistence, real billing/payment execution, API credentials, matching/business rules, schema, or production-data semantics changed. No synthetic records were seeded into production.
- PR #56 remains open for product-owner review because it changes production request persistence and is privacy/auth-adjacent.

### Product-owner review queue
- PR #56: review the proposed guard that prevents anonymous Find Inspectors searches from persisting request text while preserving authenticated client draft persistence.

## 2026-09-13 - Corrected authenticated demo versus live-data labeling
- Audited the accelerated UX/demo backlog, roadmap/protocol, development log, recent GitHub/CI state, open PRs, and Vercel production health. Production had no runtime errors in the preceding 24 hours.
- Found a misleading demo/live boundary: authenticated visitors opening an explicit `/demo/...` synthetic route lost the global Demo Mode banner while the authenticated header still labeled the session `Live data`.
- Made Demo Mode route-driven rather than authentication-driven so explicit synthetic demo routes remain clearly labeled even when a user is signed in. Authenticated demo pages retain `Logged in as` and logout controls but show `Demo view`; non-demo authenticated routes retain `Live data`.
- Added regression coverage across auth UX, demo/live isolation, and homepage demo UX. The first Autonomous QA run exposed a stale test that still required authentication-dependent banner hiding; that regression contract was corrected and the full suite rerun.
- Validate application and Autonomous QA both passed regression/unit tests, migration safety, deterministic synthetic-corpus QA, TypeScript, production build, and smoke routes. The Vercel preview reached READY, PR #68 was merged from the fully validated head, and the production deployment reached READY. Production `/demo/client` returned HTTP 200 with the route-driven Demo Mode banner verified.
- No auth/RLS policy, production persistence, real billing/payment execution, API credentials, matching/business rules, schema, or production-data semantics changed. No synthetic records were seeded into production.
- PR #56 remains open for product-owner review because it changes production request persistence and is privacy/auth-adjacent.

### Product-owner review queue
- PR #56: review the proposed guard that prevents anonymous Find Inspectors searches from persisting request text while preserving authenticated client draft persistence.

## 2026-09-12 - Added accessible Client Operations tab semantics
- Audited the accelerated UX/demo backlog, roadmap/protocol, full development log, recent commits/open PRs, CI, and Vercel production health. Production had no runtime errors in the preceding 24 hours.
- Found a remaining accessibility gap in the synthetic Client Operations experience: Billing & Payment, Contracts, Client Profile, and contract relationship controls behaved visually as tabs without exposing selected/tab-panel relationships to assistive technology.
- Added tablist/tab/tabpanel semantics, linked `aria-controls` / `aria-labelledby`, selected state, and roving tab focus to the Client Operations and contract-category controls without changing demo data or workflow logic.
- Added regression coverage protecting the new semantics. Validate application and Autonomous QA both passed regression/unit tests, migration safety, TypeScript, production build, smoke routes, and deterministic synthetic-corpus QA. The PR #67 Vercel preview reached READY and `/demo/client-operations` returned HTTP 200 with the semantics verified.
- PR #67 was squash-merged after all gates passed. No auth/RLS policy, production persistence, billing/payment execution, API credentials, matching/business rules, schema, geolocation, legal execution, or synthetic production records changed.
- PR #56 remains open for product-owner review because it changes production request persistence and is privacy/auth-adjacent.

### Product-owner review queue
- PR #56: review the proposed guard that prevents anonymous Find Inspectors searches from persisting request text while preserving authenticated client draft persistence.

## 2026-09-12 - Kept global Find Inspectors navigation on canonical Client Demo
- Audited the accelerated UX/demo backlog, roadmap/protocol, development log, open PRs, recent GitHub/CI state, and Vercel production health.
- Found one remaining canonical-route inconsistency in the global Clients dropdown: `Find Inspectors` still pointed to the retired `/demo-showcase` compatibility route even though `/demo/client` is now the canonical synthetic client experience.
- Routed `Find Inspectors` directly to `/demo/client` and changed dropdown link keys from URL-only to label-plus-URL so the intentional shared destination with `Client Demo` does not create duplicate React keys.
- Added regression coverage that requires the canonical route and rejects a return to the legacy `/demo-showcase` destination.
- Validate application and Autonomous QA both passed regression/unit tests, migration safety, TypeScript, production build, smoke routes, and deterministic synthetic-corpus QA. The final Vercel preview reached READY, and production `/demo/client` returned HTTP 200 after release. Production runtime review found no errors in the preceding 24 hours.
- PR #66 was squash-merged after all gates passed. No auth/RLS policy, production persistence, billing/payment execution, API credentials, matching/business rules, schema, production-data semantics, or synthetic production records changed.
- PR #56 remains open for product-owner review because it changes production request persistence and is privacy/auth-adjacent.

### Product-owner review queue
- PR #56: review the proposed guard that prevents anonymous Find Inspectors searches from persisting request text while preserving authenticated client draft persistence.

## 2026-09-12 - Improved Client Workspace navigation accessibility
- Added a labeled `Client Workspace navigation` landmark, a labeled nested navigation region for request methods, and `aria-current="page"` on the active Client Workspace destination.
- Added regression coverage across Request Inspectors, Inspections in Progress, Inspection History, Analytics, Billing & Payment, Contracts, and Profile so the active-state and navigation semantics cannot silently regress.
- Validate application and Autonomous QA passed. The PR #65 preview and merged production deployment reached READY; `/demo/client` returned HTTP 200 and the deployed navigation semantics were verified. Production runtime review found no errors in the preceding 24 hours.
- PR #65 was squash-merged. No auth/RLS policy, production persistence, billing/payment execution, API credentials, matching/business rules, schema, or synthetic production records changed.
- PR #56 remained review-gated because it changes production request persistence and is privacy/auth-adjacent.

### Product-owner review queue
- PR #56: review the proposed guard that prevents anonymous Find Inspectors searches from persisting request text while preserving authenticated client draft persistence.

## 2026-09-12 - Expanded dedicated Inspector Demo selection insights and feedback
- Audited the accelerated UX/demo backlog, roadmap/protocol, open PRs, recent GitHub state, CI, and Vercel production health. Production had no runtime errors in the preceding 24 hours.
- Found a remaining dedicated-demo parity gap: `/demo/inspector` covered opportunities, calendar, qualifications, reports, work history, and earnings concepts but did not expose the fuller InspectorHub roadmap experience for Active Assignments, Selection Insights, and client feedback/ratings.
- Expanded the standalone synthetic Inspector Demo with populated Active Assignments, explainable Selection Insights, client feedback and ratings detail, document-center preview, report/billing context, and demo-only interaction notices. Selection Insights explicitly avoid exposing competing inspector identities.
- Kept the experience isolated from production: the dedicated demo has no Supabase/database access, its actions do not write production records, and payment execution, tax filing, bank credentials, and inspector compensation rules remain out of scope.
- Added regression coverage protecting the expanded dedicated Inspector Demo and its production-isolation boundaries. Validate application and Autonomous QA both passed regression/unit tests, migration safety, TypeScript, production build, smoke routes, and deterministic synthetic-corpus QA. The PR #64 Vercel preview reached READY and `/demo/inspector` returned HTTP 200 with the expanded navigation.
- PR #64 was squash-merged after all gates passed. No auth/RLS policy, production persistence, real billing/payment execution, API credentials, matching/business rules, schema, compensation/tax behavior, or synthetic production records changed.
- PR #56 remains open for product-owner review because it changes production request persistence and is privacy/auth-adjacent.

### Product-owner review queue
- PR #56: review the proposed guard that prevents anonymous Find Inspectors searches from persisting request text while preserving authenticated client draft persistence.

## 2026-09-11 - Aligned Client Demo Inspection History API promotion with live workspace
- Audited the accelerated UX/demo backlog, current roadmap/protocol, recent GitHub changes, open PRs, CI, and Vercel production health.
- Found a remaining demo/live parity gap: the authenticated Client Workspace already had the requested dismissible right-side `Inspection History API` promotion, while the synthetic Client History page did not surface the same experience.
- Added the dismissible responsive API highlight to `/demo/client-history`, linking to the existing synthetic Data & Integrations demo and explicitly stating that no credentials or production data are exposed.
- Added `aria-expanded` to demo history rows and regression coverage that protects the API highlight, dismiss action, right-side layout, integration route, and absence of Supabase/environment credential access in the synthetic page.
- Validate application and Autonomous QA both passed completely, including regression/unit tests, migration safety, deterministic synthetic-corpus QA, TypeScript, production build, and route smoke tests. The PR #63 Vercel preview reached READY and production runtime review found no errors in the preceding 24 hours.
- PR #63 was squash-merged after all gates passed. No auth/RLS policy, billing/payment execution, API credentials, matching/business rules, production schema/data semantics, or synthetic production records changed.
- PR #56 remains open for product-owner review because it changes production request persistence and is privacy/auth-adjacent.

### Product-owner review queue
- PR #56: review the proposed guard that prevents anonymous Find Inspectors searches from persisting request text while preserving authenticated client draft persistence.

## 2026-09-11 - Repaired authenticated logout regression coverage
- Audited the accelerated UX/demo backlog, recent direct-main commits, open PRs, GitHub CI, and Vercel. The newest direct-main change added a logout control to the authenticated `Logged in as` / `Live data` banner.
- Found a concrete regression contract break: `tests/authUx.test.ts` still explicitly rejected any `signOut()` call, so current `main` no longer satisfied the protected auth UX test even though the production Vercel deployment was READY.
- Updated the regression test to protect the intended logout behavior instead: existing Supabase session detection remains required, logout must use `supabase.auth.signOut()`, the action is disabled while in flight, progress copy is shown, and successful logout returns to `/` and refreshes the router.
- This was a test-only repair; authentication/authorization policy and application behavior were not changed.
- Validate application and Autonomous QA both passed completely, including regression/unit tests, migration safety, synthetic-corpus generation/validation, TypeScript, production build, and smoke routes. The PR #62 Vercel preview reached READY and production runtime review found no errors in the preceding 24 hours.
- PR #62 was squash-merged after all gates passed. No schema, billing/payment, API credentials, matching/business rules, production-data semantics, or synthetic production records changed.
- PR #56 remains open for product-owner review because it changes production request persistence and is privacy/auth-adjacent.

### Product-owner review queue
- PR #56: review the proposed guard that prevents anonymous Find Inspectors searches from persisting request text while preserving authenticated client draft persistence.

## 2026-09-11 - Restored demo UX contracts after direct-main regression drift
- Audited the current UX/demo backlog, GitHub/CI, open PRs, and Vercel after a burst of direct `main` commits added sample PDF reports, richer Inspector Demo workspace content, client contract budget/spend detail, and analytics changes. Several intermediate production builds failed before the latest main deployment recovered to READY.
- Repository validation exposed 13 regressions against the protected synthetic-demo contract: Client Analytics had lost Project Type, Non-conformance, and NCR Type filtering plus related KPI/trend/detail/connectivity views; Client Demo and its sidebar bypassed the Email Requirements instruction path and lost isolation/intake wording; Client Operations lost explicit billing/contracts/coarse-location safety disclosures; Inspector Demo wording drifted while remaining technically isolated from production data.
- Restored the full seven-filter Client Analytics contract, inspection-spend/on-time/projects-with-NCR KPIs, monthly spend/geography/project-type/commodity/NCR views, cross-filtered inspection detail, CSV download, and API/Excel/Power BI handoff while keeping the 1.8% synthetic portfolio NCR story.
- Restored the Client Demo Email Requirements guidance route, exact `Select your inspection criteria.` heading, `Find Inspectors`/Upload Scope/10,000-character intake parity, and explicit no-production-write wording. Restored billing/payment, contract execution, and coarse-location safety disclosures in Client Operations.
- All 72 regression/unit tests pass. Validate application and Autonomous QA both pass migration safety, TypeScript, production build, smoke tests, and synthetic-corpus QA. The final PR #61 Vercel preview reached READY; production runtime review found no error/fatal logs in the preceding 24 hours.
- This cycle changes only synthetic demo UX, deterministic demo data presentation, routing, and regression expectations. No auth/RLS policy, production persistence, real billing/payment execution, API credentials, matching/business rules, schema, precise geolocation, legal execution, compensation/tax behavior, or production-data semantics changed; no synthetic records were inserted into production.
- PR #56 remains open for product-owner review because it changes production request persistence and is privacy/auth-adjacent.

### Product-owner review queue
- PR #56: review the proposed guard that prevents anonymous Find Inspectors searches from persisting request text while preserving authenticated client draft persistence.

## 2026-09-11 - Closed audience-login and canonical Client Demo navigation gaps
- Audited the currently specified UX/demo backlog against merged code, recent CI, open PRs, and Vercel. The audience-specific Client Login / Inspector Login presentation gap had just been closed in PR #59 while preserving existing account-role routing and auth policy.
- Found one remaining canonical-route inconsistency in the shared Client Workspace demo sidebar: Request Inspectors still returned through the retired `/demo-showcase` compatibility URL instead of the canonical `/demo/client` experience.
- Updated the shared sidebar to link and mark active state against `/demo/client`, and added regression coverage that rejects future `demo-showcase` references in that component.
- Validate application and Autonomous QA both passed, including regression/unit tests, migration safety, synthetic corpus QA, TypeScript, production build, and smoke tests. The Vercel preview reached READY and production runtime review found no errors in the preceding 24 hours.
- PR #60 was squash-merged and its production deployment reached READY. No auth/RLS policy, billing/payment execution, API credentials, matching/business rules, schema, production-data semantics, or synthetic production records changed.
- PR #56 remains open for product-owner review because it changes production request persistence and is privacy/auth-adjacent.

### Product-owner review queue
- PR #56: review the proposed guard that prevents anonymous Find Inspectors searches from persisting request text while preserving authenticated client draft persistence.

## 2026-09-10 - Locked matching hard gates with explicit regression coverage
- Audited the P0 matching reliability backlog after the currently specified UX/demo backlog was substantially complete and found the engine already enforced the intended hard gates, but several gates were not independently protected by regression tests.
- Added explicit regression coverage for required certification, minimum-experience boundary behavior, requested-start-date availability, explicit unavailable status, and cross-country international-travel capability.
- Kept matching/ranking implementation unchanged; this cycle only locks existing behavior against regression and therefore does not alter marketplace eligibility or business rules.
- Validate application and Autonomous QA both passed. The Vercel preview for PR #58 reached READY, production runtime review found no error/fatal logs in the preceding 24 hours, and PR #58 was squash-merged after all gates passed.
- The merged production deployment reached READY. No auth/RLS, billing/payment, API credentials, matching/business-rule behavior, production data, or synthetic production records changed.
- PR #56 remains open for product-owner review because it changes production request persistence and is privacy/auth-adjacent.

### Product-owner review queue
- PR #56: review the proposed guard that prevents anonymous Find Inspectors searches from persisting request text while preserving authenticated client draft persistence.

## 2026-09-10 - Made coarse Client Profile location demo-editable
- Audited the specified Client Profile backlog and found the coarse suggested location was present but explicitly disabled, so the demo did not satisfy the requested editable coarse-location experience.
- Replaced the disabled control with a browser-session-only city/region/country text field backed only by local React state. Added explicit guidance that the value is not saved, geocoded, or written to production and that precise geolocation is neither collected nor requested.
- Added regression coverage for editability, city/region/country guidance, absence of browser geolocation access, absence of Supabase access, and the synthetic production-isolation boundary.
- Validate application and Autonomous QA both passed. The Vercel preview for PR #57 reached READY and production runtime review before merge found no errors in the preceding 24 hours.
- PR #57 was squash-merged after all gates passed. No authentication/authorization policy, production profile persistence, privacy/PII collection, geolocation integration, billing/payment execution, matching/business rules, or production data semantics changed; no synthetic records were inserted into production.
- PR #56 remains open for product-owner review because it changes production request persistence and is privacy/auth-adjacent.

### Product-owner review queue
- PR #56: review the proposed guard that prevents anonymous Find Inspectors searches from persisting request text while preserving authenticated client draft persistence.

## 2026-09-10 - Made Client Demo the canonical synthetic experience
- Audited the merged next-24-hour UX/demo backlog and found `/demo/client` still redirected into the legacy `/demo-showcase` route, leaving the supposedly dedicated Client Demo dependent on an obsolete URL.
- Moved the full synthetic Client Demo request-intake and portfolio experience to `/demo/client` and converted `/demo-showcase` into a compatibility redirect back to the canonical Client Demo route.
- Updated Client Demo and client-intake regression coverage to protect the canonical route, full synthetic portfolio links, current intake wording, and production-isolation boundary.
- The first CI pass correctly failed because a stale intake regression still inspected the legacy showcase file. Updated that test to target the canonical Client Demo rather than weakening coverage.
- Final Validate application and Autonomous QA both passed, including regression/unit tests, migration safety, synthetic corpus QA, TypeScript, production build, and smoke routes. The final Vercel preview reached READY.
- PR #55 was squash-merged after all gates passed. No authentication/RLS policy, real billing/payment execution, API credentials, matching/business rules, production schema/data semantics, or synthetic production records changed.

### Product-owner review queue
No decision required.

## 2026-09-10 - Fully removed obsolete What We Do route
- Removed the remaining standalone `/what-we-do` route after its navigation entry had already been retired, keeping the home page as the concise product explanation.
- Added regression protection so the obsolete route cannot silently return.
- Validate application and Autonomous QA passed, and PR #54 was squash-merged to `main`; the merged production smoke test passed.
- No authentication/RLS policy, billing/payment execution, API credentials, matching/business rules, or production data changed; no synthetic records were inserted into production.

### Product-owner review queue
No decision required.

## 2026-09-09 - Restored complete client analytics cross-filtering
- Audited the currently specified UX/demo backlog against merged code and found a real analytics regression: Project Type, Timing, and NCR Type slicers plus richer spend/timing KPI and trend views had drifted out of the current Client Analytics Demo.
- Restored deterministic synthetic spend, timing, and multiple NCR-type dimensions; added seven cross-filters across Project, Project Type, Country, Commodity, Timing, Non-conformance, and NCR Type.
- Restored meaningful synthetic analytics with inspection-spend, inspection-count, on-time-performance, and projects-with-NCR KPIs; monthly spend trend; geography/map-style, project-type, commodity, NCR-type and quality/timing views; cross-filtered detail; downloadable CSV; and API/Excel/Power BI connectivity handoff.
- Strengthened regression coverage for the full requested analytics contract and explicit production-data isolation. No synthetic records were inserted into production.
- Validate application and Autonomous QA both passed, including regression/unit tests, migration safety, synthetic corpus QA, TypeScript, production build, and smoke routes. The final Vercel preview reached READY and `/demo/client-analytics` returned HTTP 200 with the restored slicers and analytics views.
- PR #53 was squash-merged after all gates passed. No authentication/RLS policy, real billing/payment execution, API credentials, matching/business rules, production schema/data semantics, or live-data paths changed.

### Product-owner review queue
No decision required.

## 2026-09-09 - Locked exact homepage brand line after backlog audit
- Audited the currently specified next-24-hour UX/demo backlog against the merged implementation and confirmed the major Client Demo, Inspector Demo, demo/live isolation, navigation, intake, analytics, client operations, accessibility, and data-connectivity work is already present from prior cycles.
- Corrected the remaining homepage copy drift so the hero now renders the product-owner-requested line exactly as `InspectSource — Eyes, Ears, and Expertise, Everywhere.` while preserving the existing compact Client/Inspector split and blue/teal visual treatment.
- Strengthened `homeDemoUx` regression coverage to require the exact brand line so the wording cannot silently drift again.
- Validate application and Autonomous QA both passed, including regression tests, migration safety, synthetic corpus QA, TypeScript, production build, and smoke tests. The final Vercel preview reached READY.
- PR #52 was squash-merged after all gates passed. No authentication/authorization policy, billing/payment execution, matching/business rules, API credentials, production-data semantics, or synthetic production records changed.

### Product-owner review queue
No decision required.

## 2026-09-09 - Clarified authenticated live-data state and repaired demo regression drift
- Added an authenticated global navigation status that displays `Logged in as <email>` with a `Live data` indicator using the existing Supabase session, while leaving authentication/authorization enforcement unchanged and keeping the status absent for unauthenticated synthetic demo visitors.
- Restored Client Operations Demo safeguards that had drifted in recent direct commits: Billing again explicitly excludes payment credentials/bank data, Contracts again expose expandable synthetic document/approval detail with no e-signature/legal execution, and Client Profile again labels coarse location, roles/approval authority, account-security concepts, and no precise geolocation.
- Updated Inspector Demo isolation coverage for the new standalone synthetic `/demo/inspector` experience rather than the superseded redirect behavior, retaining explicit assertions that it has no production inspector/database access; authenticated InspectorHub remains inspector-scoped live data and demo writes remain blocked.
- The first validation run surfaced six stale regression assertions introduced by recent direct main-branch demo changes. The new authenticated-session test itself passed. Regression coverage was aligned to the current analytics detail view and restored operations/isolation safeguards instead of weakening production-isolation checks.
- No synthetic records were inserted into production. No auth/RLS policy, real billing/payment execution, API credentials, matching/business rules, precise geolocation, compensation/tax behavior, or legal execution behavior changed.

### Product-owner review queue
No decision required.

## 2026-09-08 - Consolidated dedicated demo navigation and retired stale PRs
- Aligned global navigation with the dedicated `/demo/client` and `/demo/inspector` entry points: each audience dropdown now exposes its Demo directly beneath its Login, and the top-level Client Demo no longer routes through the legacy `/demo-showcase` entry.
- Preserved the existing Find Inspectors route and all authentication, billing/payment, matching, API-credential, and production-data behavior; no synthetic records were inserted into production.
- Retired stale superseded PRs #26, #28, and #29 so older demo/client-dashboard implementations cannot be accidentally merged over the current architecture.
- An initial broadened regression assertion failed unit tests; the assertion and unrelated route change were removed rather than weakening existing QA. Final Validate application and Autonomous QA both passed, including regression tests, migration safety, synthetic QA, TypeScript, production build, and smoke tests. Vercel preview reached READY.
- PR #50 was squash-merged after all gates passed; its production deployment was building at the final cycle check. Production runtime review before release found no errors in the preceding 24 hours.

### Product-owner review queue
No decision required.

## 2026-09-08 - Consolidated complete Client Demo entry experience
- Added a dedicated `/demo/client` entry parallel to `/demo/inspector` and routed the home-page `Open Client Demo` action through it while reusing the existing synthetic Client Demo architecture.
- Expanded the Client Demo hub so the full synthetic experience is discoverable from one place: request intake, inspection history, analytics, Billing & Payment / Contracts / Client Profile, and Data & Integrations.
- Added a direct switch from Client Demo to Inspector Demo and explicit wording that deterministic synthetic demo data never writes records to production.
- Added regression coverage for the dedicated client route, complete synthetic-client portfolio links, request-intake wording parity, and absence of production-write behavior in the entry route.
- Validate application and Autonomous QA both passed, including regression tests, migration safety, synthetic corpus QA, TypeScript, production build, and smoke tests. The final Vercel preview reached READY, and production runtime review before release found no errors in the preceding 24 hours.
- PR #49 was squash-merged after all gates passed. No authentication/authorization policy, billing/payment execution, API credentials, matching/business rules, or production-data semantics changed; no synthetic records were inserted into production.

### Product-owner review queue
No decision required.

## 2026-09-08 - Hardened responsive and keyboard accessibility baseline
- Added a global keyboard `Skip to main content` link and focusable main landmark so keyboard and assistive-technology users can bypass repeated navigation.
- Added consistent visible `:focus-visible` treatment, 44px minimum interactive control height, reduced-motion handling, and tighter small-screen card/action layouts across the application shell.
- Improved Client/Inspector dropdown semantics with `aria-controls`, `aria-haspopup`, existing `aria-expanded`, Escape-to-close behavior, and matching focus-visible styling for buttons and menu links.
- Added regression coverage for skip navigation, dropdown semantics, keyboard focus visibility, touch targets, small-screen layout collapse, and reduced-motion support.
- Validate application and Autonomous QA both passed, including regression tests, migration safety, synthetic QA, TypeScript, production build, and smoke tests. The final Vercel preview reached READY and returned HTTP 200 with the new application-shell accessibility markup.
- No authentication/authorization policy, billing/payment behavior, matching/business rules, production-data semantics, or synthetic production records were changed.

### Product-owner review queue
No decision required.

## 2026-09-08 - Tightened demo/live isolation and Inspector Demo entry
- Audited global demo-state behavior and found the synthetic-data banner was shown on every unauthenticated route except the home page, including login/register and non-demo live-workspace entry pages.
- Added an explicit demo-experience route classifier so the global `Demo Mode` banner is limited to synthetic experiences (`/demo/*`, `/demo-showcase`, and unauthenticated InspectorHub) and remains hidden for authenticated live-data sessions and ordinary public/auth routes.
- Added the previously advertised `/demo/inspector` entry route and aligned the home-page Inspector Demo CTA to it; the route resolves into the existing populated InspectorHub synthetic experience rather than creating duplicate demo business logic.
- Added regression coverage for demo-route isolation, non-demo banner exclusion, Inspector Demo routing, blocked demo writes, and authenticated inspector-scoped live data loading.
- Validate application and Autonomous QA both passed, including regression tests, migration safety, synthetic QA, TypeScript, production build, and smoke tests. Vercel preview reached READY.
- PR #47 was squash-merged after all gates passed. No authentication/authorization policy, RLS, billing/payment behavior, matching/business rules, or production-data semantics were changed; no synthetic records were inserted into production.

### Product-owner review queue
No decision required.

## 2026-09-07 - Structured client progress and history UX
- Reworked `Inspections in Progress` into three clearly separated expandable workflow groups: `Active Inspections`, `Pending Requests`, and `Submitted Reports`, while retaining authenticated client-scoped live inquiry data and making no matching/business-rule changes.
- Replaced the repeated `Manage your inspection program` hero with a compact section-aware workspace header to recover vertical screen real estate.
- Converted the Inspection History API promotion into a dismissible right-side highlight with responsive stacking and a link to the existing synthetic Data & Integrations Demo.
- Aligned remaining Client Workspace Email Requirements links to the instruction page instead of bypassing it with a direct mailto.
- Added regression coverage for the three progress groups, expandable accessibility state, dismissible API highlight, compact header, and Email Requirements routing.
- Validate application and Autonomous QA both passed, including regression tests, migration safety checks, synthetic corpus QA, TypeScript, production build, and route smoke tests. Vercel preview reached READY and returned HTTP 200 on the Client Workspace route.
- PR #46 was squash-merged after all gates passed; the feature production deployment reached READY. No authentication/authorization policy, billing/payment behavior, API credentials, production schema/data semantics, or synthetic production records were changed.

### Product-owner review queue
No decision required.

## 2026-09-07 - Expanded Inspector Demo end-to-end experience
- Expanded unauthenticated InspectorHub from a work-history preview into a fuller deterministic synthetic inspector experience covering matched opportunities, active assignments, schedule/availability, Selection Insights, client ratings, qualifications/documents, reports/billing closeout, and work history.
- Kept demo interactions read-only: Add Activity and CSV Upload remain visible but are blocked outside authenticated live mode, and the demo explicitly states that it does not execute payments, file taxes, handle bank credentials, or change inspector compensation rules.
- Preserved authenticated live behavior, including inspector-scoped loading from `inspector_work_activities`; no authentication/authorization policy or production-data semantics changed.
- The first CI run exposed five stale regression assertions left behind by recent client analytics and demo-aware routing changes on main. Updated those tests to verify the current 60-record synthetic analytics experience, drilldowns/export, production isolation, and `?demo=1` email-routing behavior without weakening safety coverage.
- Validate application and Autonomous QA passed after correction, including regression tests, migration checks, synthetic corpus QA, TypeScript, production build, and smoke tests. The Vercel preview reached READY.
- PR #45 was squash-merged after all gates passed. No real billing/payment, tax filing, compensation, matching/business-rule, auth/security, or production-data behavior changed; no synthetic records were inserted into production.

### Product-owner review queue
No decision required.

## 2026-09-07 - Added interactive synthetic client analytics demo
- Added a dedicated read-only `Client Analytics Demo` with deterministic synthetic inspection data and cross-filtering across Region, Commodity, Project type, Timing, Non-conformance, and NCR type.
- Added synthetic KPIs for inspection spend, inspection visits, on-time rate, and projects with NCR, plus monthly spend trends, a clickable geography view, project-type mix, NCR-type mix, and responsive inspection detail.
- Added `Client Analytics Demo` under the Clients navigation and regression coverage for the requested analytics dimensions, cross-filter experience, navigation exposure, and production-data isolation.
- The first validation run exposed a test-only false positive where the isolation assertion interpreted JavaScript `Array.from(...)` as a Supabase `.from(...)` call; the assertion was narrowed to actual Supabase access and all validation gates then passed.
- Validate application and Autonomous QA passed, including regression tests, migration checks, synthetic corpus QA, TypeScript, production build, and smoke tests. Vercel preview reached READY and `/demo/client-analytics` returned HTTP 200.
- PR #44 was squash-merged after all checks passed. No authentication/authorization policy, billing/payment behavior, matching/business rules, API credentials, or production data were changed; no synthetic records were inserted into production.

### Product-owner review queue
No decision required.

## 2026-09-07 - Added populated synthetic client operations demo
- Added a read-only `Client Operations Demo` with populated deterministic synthetic Billing & Payment, Contracts, and Client Profile experiences.
- Billing demonstrates invoice amounts, balances, statuses, purchase-order references, approvals, due dates, expandable details, KPIs, and payment-history workflow concepts without executing payments or handling real financial credentials.
- Contracts are organized into `InspectSource`, `Agencies`, `Individual Inspectors`, and `Others` with expandable synthetic records, document/approval concepts, and explicit no-e-signature/no-legal-execution safeguards.
- Client Profile demonstrates avatar, login email, phone/SMS, preferred contact, coarse city-level suggested location, company/title/department, timezone/language/notifications/hours, roles/access, approval authority/limits, and account-security concepts without changing live auth/security or collecting precise geolocation.
- Added `Client Operations Demo` under the Clients navigation and regression coverage for populated demo behavior, requested fields, read-only synthetic isolation, and absence of Supabase production writes.
- Validate application and Autonomous QA both passed, including regression tests, migration checks, synthetic corpus QA, TypeScript, production build, and smoke tests.
- Vercel preview reached READY and `/demo/client-operations` returned HTTP 200; PR #43 was squash-merged after all checks passed and the feature production deployment reached READY with HTTP 200 on the new route.
- No real billing/payment behavior, legal execution, authentication/authorization policy, privacy/PII handling, matching/business rules, or production data were changed; no synthetic records were inserted into production.

### Product-owner review queue
No decision required.

## 2026-09-06 - Added synthetic client data connectivity demo
- Added a dedicated `Data & Integrations Demo` for clients with deterministic synthetic inspection records, downloadable CSV export, and a visible synthetic-data boundary.
- Demonstrated Excel/CSV, InspectSource API, Power BI, and ERP/procurement connectivity concepts without issuing API credentials or connecting to a live tenant.
- Added a sample client inspection API endpoint copy action, responsive export preview, and a simple InspectSource -> API/export -> Excel/Power BI/ERP data-flow illustration.
- Added the demo under the Clients navigation dropdown and regression coverage for synthetic isolation, CSV download, connectivity concepts, and navigation exposure.
- Validate application and Autonomous QA both passed, including regression tests, migration checks, synthetic corpus QA, TypeScript, production build, and smoke tests.
- Vercel preview reached READY and `/demo/client-data` returned HTTP 200 with the synthetic export experience; PR #42 was squash-merged after all validation gates passed.
- Production runtime review before release found no errors in the preceding 24 hours.
- No live API credentials, authentication/authorization policy, billing behavior, matching/business rules, or production data were changed; no synthetic records were inserted into production.

### Product-owner review queue
No decision required.

## 2026-09-06 - Polished Structured Selection heading and demo treatment
- Updated Structured Selection to the requested `Select your inspection criteria.` heading.
- Replaced the high-contrast yellow demo warning with a subtle teal `Demo Mode · Synthetic data` treatment while keeping synthetic data clearly identified.
- Added regression coverage for the requested heading and demo styling while retaining required-field, Find Inspectors, day-rate, layout, and Reset-button coverage.
- Validate application and Autonomous QA both passed, including regression tests, migration checks, synthetic-data QA, TypeScript, production build, and route smoke tests.
- Vercel preview reached READY and PR #41 was squash-merged after all checks passed; production promotion was initiated from the validated merge commit.
- Production runtime review before release found no errors in the preceding 24 hours.
- No authentication, authorization, billing, matching/business-rule, or production-data behavior changed, and no synthetic records were inserted into production.

### Product-owner review queue
No decision required.

## 2026-09-06 - Added Copy Sample Request to Email Requirements
- Added the requested `Copy Sample Request` action to the Email Requirements guidance page so clients can copy the complete synthetic sample request in one click before opening their email client.
- Added accessible `aria-live` confirmation, clipboard-error fallback guidance, and responsive button styling while preserving the existing InspectSource-prefixed email subject and attachment guidance.
- Added regression coverage for the visible action, clipboard behavior, accessible feedback, and copy confirmation.
- Validate application and Autonomous QA both passed, including unit/regression tests, migration checks, synthetic-data QA, TypeScript, production build, and route smoke tests.
- Vercel preview reached READY and `/email-requirements` returned HTTP 200 with the new Copy Sample Request control; PR #40 was squash-merged after validation.
- Production runtime review found no errors in the preceding 24 hours.
- No authentication, authorization, billing, matching/business-rule, or production-data behavior changed, and no synthetic records were inserted into production.

### Product-owner review queue
No decision required.

## 2026-09-06 - Tightened homepage screen real estate
- Reduced the home page brand-banner, audience-card, feature-list, demo-entry, and trust-strip spacing so the Client/Inspector split uses substantially less vertical space without removing product-owner content.
- Preserved the existing single InspectSource brand banner, clearly separated Client/Inspector paths, requested workflow benefits, demo entry points, and blue/teal visual language.
- Added regression coverage requiring the compact layout cues and client/inspector color differentiation to remain present.
- Validate application and Autonomous QA both passed, including regression tests, migration checks, synthetic QA, TypeScript, production build, and smoke tests.
- Vercel preview reached READY; PR #39 was squash-merged after validation and the production deployment reached READY.
- Production runtime review found no errors in the preceding 24 hours.
- No authentication, authorization, billing, matching/business-rule, or production-data behavior changed, and no synthetic records were inserted into production.

### Product-owner review queue
No decision required.

## 2026-09-06 - Clarified enforced registration password minimum
- Added accessible registration guidance stating the existing six-character minimum and tied the visible hint to the same `MIN_PASSWORD_LENGTH` constant used by the form.
- Added `aria-describedby` so assistive technology associates the password field with its policy hint.
- Did not change Supabase authentication configuration, authorization policy, account security rules, or any production-data behavior.
- Added regression coverage requiring the visible password guidance and form enforcement to remain synchronized.
- Validate application and Autonomous QA passed, including synthetic corpus generation/validation, unit tests, migration checks, TypeScript, production build, and route smoke tests.
- PR #38 was squash-merged after all gates passed; Vercel preview and production deployment reached READY, and no production runtime errors were found after release.
- No synthetic records were inserted into production.

### Product-owner review queue
No decision required.

## 2026-09-04 - Aligned Client Demo request intake with production UX
- Found that the synthetic Client Demo still showed stale numbered request cards, `Find qualified inspectors`, and the old direct-email flow after production intake had already been updated.
- Removed the obsolete numbered markers and aligned the demo copy with the current Natural Language, Email Requirements, and Structured Selection paths.
- Added the 10,000-character request limit and visible character count, surfaced the `Upload Scope` cue, changed the action to `Find Inspectors`, and routed email users to the Email Requirements guidance page instead of a legacy mailto flow.
- Preserved the existing synthetic project story and structured demo route; no authentication policy, billing behavior, matching rules, or production data semantics changed.
- Added regression coverage requiring demo/production intake wording and routing parity.
- Validate application and Autonomous QA both passed, including regression tests, migration safety checks, TypeScript, production build, smoke tests, and synthetic QA.
- Vercel preview returned HTTP 200 with the updated Client Demo, PR #37 auto-merged after checks passed, and the production deployment reached READY. No production runtime errors were found before release.

### Product-owner review queue
No decision required.

## 2026-09-04 - Corrected Client Demo entry routing
- Found that the new `Client Demo` CTA still opened `/client-dashboard`, which intentionally blocks unauthenticated users with a login message.
- Routed only the dedicated `Open Client Demo` CTA to the existing `/demo-showcase` synthetic environment so an unauthenticated visitor immediately sees populated demo data.
- Left `Explore Client Workspace` and all authenticated client-dashboard live-data behavior unchanged; this cycle did not alter authentication policy, RLS, matching rules, billing, or production data semantics.
- Added regression coverage requiring the Client Demo CTA to target the synthetic demo route.
- Validate application and Autonomous QA both passed, including regression tests, migration checks, synthetic QA, TypeScript, production build, and smoke routes; the final Vercel preview reached READY.
- PR #36 was squash-merged after all gates passed. Production runtime-error review found no errors in the preceding 24 hours, and no synthetic records were inserted into production.

### Product-owner review queue
No decision required.

## 2026-09-04 - Polished home page demo entry experience
- Removed the Demo Mode / synthetic-data banner from the public home page while preserving the authentication-aware banner on unauthenticated demo/workspace routes.
- Added the requested client benefit: `Manage contracts, approvals and payments`.
- Added the requested inspector benefit: `Manage billing, documentation, and tax reporting`.
- Added clearly labeled `Client Demo` and `Inspector Demo` entry panels that route into the existing client and inspector experiences rather than creating separate demo products.
- Removed the obsolete `What We Do` top-level navigation link; the home page remains the concise product explanation.
- Preserved Client Login and Inspector Login inside their respective dropdowns and retained the blue/teal client-vs-inspector visual treatment.
- Added regression coverage for all five product-owner priorities, including public-home banner exclusion.
- Validate application and Autonomous QA both passed, including regression tests, migration checks, synthetic QA, TypeScript, production build, and smoke tests.
- Vercel preview returned HTTP 200 with the updated home experience and no preview error/fatal runtime logs; PR #35 was squash-merged after checks passed.
- Production deployment reached READY after merge. No auth policy, matching rules, billing behavior, or production data semantics were changed, and no synthetic records were inserted into production.

### Product-owner review queue
No decision required.

## 2026-09-03 - Added InspectorHub synthetic demo mode
- Changed InspectorHub so unauthenticated visitors see a populated synthetic work-history experience instead of a login-only dead end.
- Reused the live InspectorHub component and controls so demo and production remain on one architecture rather than maintaining a separate demo product.
- Added three deterministic synthetic work-history records covering earnings, expenses, mileage, hours, projects, locations, and roles.
- Added clear `Synthetic Demo` messaging and teal visual treatment consistent with the inspector side of the redesigned home page.
- Kept Add Activity and CSV Upload visible in demo mode, but hard-blocked both write paths unless the authenticated `live` mode is active; demo interactions explain that they do not write to a live account.
- Preserved authenticated loading of inspector-scoped `inspector_work_activities` records.
- Added regression tests for demo record routing, write blocking, and preservation of authenticated live-data loading.
- Validate application and Autonomous QA both passed, including synthetic QA, migration checks, TypeScript, production build, and smoke tests.
- Vercel preview completed successfully and preview runtime logs showed no error/fatal events during validation.
- PR #34 merged after all repository checks passed; no authorization policy was relaxed and no synthetic records were inserted into production.

### Product-owner review queue
No decision required.

## 2026-09-03 - Established global demo-mode foundation and split home experience
- Moved `Client Login` and `Inspector Login` into their respective navigation dropdowns and removed the separate top-level login controls.
- Added a global authentication-aware Demo Mode banner that appears only for unauthenticated users and clearly states that the visible experience uses synthetic data.
- Redesigned the home page around `InspectSource — Eyes, Ears, and Expertise, Everywhere.` with two clear paths: Clients and Inspectors.
- Added restrained blue/teal visual differentiation so client and inspector experiences are easier to scan without making the interface busy.
- Added regression tests covering the brand line, client/inspector split, login placement, and demo-banner authentication behavior.
- The first preview exposed a Server/Client Component styling error on the redesigned home page; it was fixed immediately before release.
- Validate application and Autonomous QA both passed after the fix, including synthetic QA, migration checks, TypeScript, production build, and smoke tests.
- Corrected Vercel preview reached READY, returned HTTP 200 on the redesigned home page, and PR #33 merged to main.
- Production runtime logs showed no errors before release.

### Follow-on
Unauthenticated synthetic-data routing across every workflow remains a separate auth/data-behavior change and should be implemented carefully without ever seeding synthetic records into production.

### Product-owner review queue
No decision required.

## 2026-09-03 - Polished natural-language and email requirement intake
- Renamed the natural-language upload control to `Upload Scope`, added a visible upload icon, and changed the action label from `Find Qualified Inspectors` to `Find Inspectors`.
- Set a visible 10,000-character limit for natural-language requests and apply the same limit when loading supported text scope files.
- Replaced the direct Email Requirements mailto link with a guidance page containing copy-ready sample text, expected request fields, attachment guidance, and a prefilled `InspectSource - Inspection Request` subject.
- Added regression coverage for wording, character-limit enforcement, upload guidance, email instructions, and subject formatting.
- The first Vercel preview exposed a Server/Client Component styling mistake; it was corrected immediately by marking the new styled page as a Client Component.
- Final Validate application and Autonomous QA workflows passed, the corrected Vercel preview succeeded, and PR #32 merged to main.

### Product-owner review queue
No decision required.

## 2026-09-02 - Improved structured selection usability
- Added a clear `DEMO — Uses Synthetic Data` banner to the structured-selection demo and kept the demo on the production component architecture.
- Made Location and Start Date required before matching, with accessible required-state markup and a clear validation message.
- Widened the structured-selection workspace, reduced the desktop grid from four to three columns, and improved Reset-button contrast/readability.
- Kept day rate as a direct numeric entry and populated a visible synthetic day-rate example in demo mode.
- Replaced `Identify inspectors` with `Find Inspectors` for clearer client-facing language.
- Added regression coverage for the demo marker, required fields, wording, day-rate entry, wider layout, and Reset readability.
- Standard application validation and Autonomous QA both passed; Vercel preview reached READY before merge through PR #31.

### Product-owner review queue
No decision required.

## 2026-09-02 - Fixed structured day-rate matching parity
- Found a request-normalization gap: the structured selection form emitted day-rate caps as `maximum day rate USD 950`, while the shared parser primarily recognized `/day` or `per day` wording.
- Updated the shared parser so structured, natural-language, and email-style day-rate wording normalize into the same `maximumDayRate` and currency fields.
- Added regression tests proving the structured rate cap is parsed and over-budget inspectors are excluded by the existing hard eligibility gate.
- Standard validation passed regression tests, migration checks, TypeScript, production build, and route smoke tests.
- Autonomous QA passed synthetic generation/validation plus the full application validation suite.
- Vercel preview reached READY before merge; the change was promoted through PR #30.

### Product-owner review queue
No decision required.

## 2026-09-02 - Fixed client workspace deep-link navigation
- Fixed Client Workspace links from natural-language and structured search pages so `?section=active`, `history`, `analytics`, `billing`, `contracts`, and `profile` now open the intended dashboard section instead of always falling back to Request Inspectors.
- Added safe parsing and bookmarkable URL generation for dashboard sections, including fallback to Request Inspectors for invalid section values.
- Dashboard section changes now update browser history and respond correctly to Back/Forward navigation.
- Removed the obsolete numbered markers from the three Request Inspectors cards at the component level rather than relying only on CSS hiding.
- Added regression tests covering valid sections, invalid/missing sections, and generated dashboard URLs.
- Autonomous QA passed synthetic generation, unit tests, migration checks, TypeScript, production build, and route smoke tests.
- Vercel production deployment reached READY and no production runtime errors were found after deployment.

### Product-owner review queue
No decision required.

## 2026-09-01 - Restored matching regression QA
- Diagnosed the red validation gate: a legacy ranking test expected an inspector who now correctly fails hard eligibility gates to remain in the ranked results.
- Updated coordinator regression coverage to verify both behaviors explicitly: ineligible candidates are excluded, while eligible candidates are still ranked by fit.
- Synthetic QA passed with 5,000 inspectors, 500 clients, 2,000 assignments, 10,000 schedule records, 5,000 reports, and 3,000 invoices.
- Autonomous QA passed generation, unit tests, migration checks, TypeScript, production build, and route smoke tests.
- Standard application validation passed all regression, migration, typecheck, build, and smoke checks.
- Vercel production deployment for the fix reached READY; no production runtime errors were found in the preceding 24 hours.

### Product-owner review queue
No decision required.

## 2026-08-31 - Autonomous development system initialized
- Added `PRODUCT_ROADMAP.md` with product principles, priorities, shipping guardrails, and definition of done.
- Added `AUTONOMOUS_DEVELOPMENT.md` with the recurring development protocol.
- Added deterministic synthetic-data generation and QA infrastructure.
- Added scheduled CI validation for synthetic corpus generation and application quality checks.
- Established policy that synthetic data is QA-only and must never be inserted into production.

### Current focus
1. Stabilize the client Request Inspectors workflow across natural language, email, and structured selection.
2. Maintain demo/production parity.

## 2026-11-04 — GitHub-hosted development runner

Added a manual validation-only check and a manual coding mode. The proposed
04:00, 08:00, 14:00 and 20:00 America/Chicago recurring trigger is commented
out until the manual pilot succeeds. The coding job reads the approved queue
and open PRs. A separate job publishes validated patches for review.
Run the manual check first, configure the Actions secret OPENAI_API_KEY and
allow Actions to create pull requests, then dispatch develop. Enable recurrence
only after a successful pilot by restoring the commented trigger in a reviewed
change and setting the Actions variable INSPECTSOURCE_DEV_LOOP_ENABLED=true.
Retire the previous scheduler only after verifying the replacement.

Validation: `npm run validate` passed 129 tests, migration safety, synthetic
QA, TypeScript, production build and all four local route smoke checks.
Workflow YAML and six shell steps passed parsing/syntax checks; the only
active trigger is `workflow_dispatch`. The GitHub Actions manual pilot has
not been run. Existing Dev Loop settings were not changed.


## 2026-11-04 — Manual runner pilot: D-Bus security setup failure

The first coding pilot failed before Codex could edit the checkout:
`Could not restrict access to /run/dbus/system_bus_socket`, followed by
`/usr/bin/sudo exited with code 1`. The current upstream action still uses
this ACL verification path; an action version bump is not a demonstrated fix.

Added a hosted-runner-only preparation step that stops and runtime-masks both
system D-Bus units, verifies they are inactive, and removes the unused socket
pathname before Codex starts. Failures stop the job. The job does not need
system D-Bus; masking prevents socket activation while Codex runs. The action
continues to use its pinned revision, explicit `drop-sudo`, and `:workspace`
permission profile, including its checks on other privileged service sockets.
The separate publishing job runs on a fresh host and is unchanged.

Recurrence remains commented out, and the existing Dev Loop is unchanged.
This is a candidate fix for the hosted runner: the manual `develop` pilot must
be rerun after review/merge to verify the actual image and action integration.

Local validation: `npm run validate` passed 134 tests, migration safety,
synthetic QA, typecheck, production build and four route smoke checks. Five
runner regressions exercise the preparation shell with fake service commands
and a real temporary Unix socket, including successful cleanup, active-unit
rejection, service-command failure propagation, hosted-only enforcement, and
retained workflow security settings. Workflow YAML, all seven shell steps,
and `git diff --check` passed. Actual systemd/Codex integration remains pending
the GitHub-hosted manual pilot; local tests do not establish that it succeeds.

## 2026-11-04 — Reproduced the runner socket-check compatibility failure

The D-Bus workaround exposed the same failure on the DHCP socket; stopping
individual services did not address the underlying cause. Reproduced the
Codex action's O_PATH descriptor, named-user ACL and setpriv/test sequence in
isolated Ubuntu 26.04 and 24.04 containers. Ubuntu 26.04 uses uutils/Rust
`/usr/bin/test`, which reports the ACL-denied socket as writable. Ubuntu 24.04's
GNU test correctly reports denial. The named-user ACL is effective at the
kernel connection layer; the newer utility's permission check is the problem.
The upstream action currently retains the affected verification path.

Pin the coding job to `ubuntu-24.04`, remove the D-Bus stop/mask workaround,
and leave D-Bus, DHCP and other runner services running. Avoid replacing
essential utility packages or weakening the action's protections. Retain the
pinned Codex action, explicit `drop-sudo` and `:workspace` profile. Add a
fail-closed preflight using only a temporary root-owned socket: it checks
initial access, applies the ACL, verifies actual kernel connection denial and
then checks the same descriptor-based test command used by the action.
Recurrence remains commented out; publishing and the existing Dev Loop are
unchanged. The complete GitHub-hosted coding pilot still needs to be rerun
after review/merge; local containers verify the compatibility fix, not the
entire GitHub Actions integration.

Validation: `npm run validate` passed all 133 tests, migration safety,
synthetic QA, TypeScript, production build and all four route smoke checks.
The final preflight passed in the Ubuntu 24.04 container with networking
disabled. On Ubuntu 26.04 it confirmed kernel connection denial but failed
at the permission utility, with `expected exit 1, got 0`, reproducing the
incompatibility. YAML/shell checks and `git diff --check` passed. No live
runner services were changed during this investigation.

## 2026-11-04 — Control visibility and connected Inspector Demo workflow

Open PR exclusions: #101 already owns Client Demo inspections in progress,
entry paths, live/dashboard routing and audience navigation; no overlapping
implementation was attempted. #56 owns anonymous search write protection.
Client Demo's owner-reported empty inspections page remains dependent on #101;
this batch does not claim that pending PR has shipped.

Fixed inherited white button labels on pale/transparent surfaces in Source of
Inspectors, inspector affiliation tabs/actions, Client Analytics export actions,
history project cards and Equipment Intelligence. Added explicit input text,
placeholder and shared interaction styling, plus regression checks for those
local background/label pairs. Calendar hover now also pairs its dark background
with white text.

Connected the previously unused Month/Week/List calendar to Inspector Demo.
October 2026 is an explicitly fixed synthetic sample month. Added inspector-only
Doctor Appointment and full-day Our Anniversary titles, simulated Other Calendar
linking, session-local date-range availability updates and protection against
replacing assigned dates. External personal events remain present when updating
availability. No OAuth, production calendar persistence or privacy rules changed.
Calendar assignment events and Active Assignments now open three synthetic detail
workspaces with client/vendor/site/contact, scope/PO, equipment, dates, completed
actions, outstanding tasks/owners/due dates and contextual synthetic report PDFs.
Section navigation clears opportunity outcome notices to prevent banner leakage.

Validation: all 138 tests passed using `node --import tsx --test
--test-isolation=none --test-reporter=tap tests/*.test.ts`; TypeScript, migration
safety (10 files), full synthetic QA and final production build passed.
`git diff --check` passed. Standard `npm run validate` cannot run its tsx CLI
in this sandbox because opening its IPC pipe returns EPERM; direct loading
ran the full suite successfully. Local route smoke failed to start its server;
a direct Next start confirmed TCP listen EPERM. The publishing workflow must
rerun normal validation and smoke tests outside this restriction. No commits,
pushes, CI edits, production mutations or deployment verification occurred.
Preview READY and production READY remain unverified; do not report deployed.

Next: finish calendar navigation beyond the fixed sample month and meaningful
interaction/browser contrast tests in a server-capable runner, then continue
Selection Insights and Feedback. Production parity backlog: authenticated calendar
editing and assignment details should use the same UI with authorized real data;
private-event visibility, live synchronization and persistence remain review-only.
Keep #101's Client Demo inspections and routing validation ahead of shipping this
batch. Existing automation settings are unchanged.


## 2026-11-06 — Reconcile synthetic Selection Insights onto main

Rebased the safe Selection Insights & Feedback demo from former PR #106 onto main after PR #105. Kept calendar-first priorities and existing automation enabled; discarded PR #106's conflicting roadmap and recurrence changes. Demo-only peer comparisons and minimum-cohort suppression, regression tests, InspectorHub demo link, and additive smoke route retained. No live data, production auth, matching or database changes. GitHub Actions and Vercel verification required before merge.


## 2026-11-06 — Qualifications & Documents safe reconciliation after #108

Rebased standalone demo-only Qualifications & Documents workflow from #107 onto merged #108. Browser-local pending sample evidence, expiry metadata, public qualification requirements, focused regional recommendation examples and regression tests, with no live data writes. Preserved Calendar-first priority, current InspectorHub insights link, all prior smoke routes and unchanged recurring automation. Requires passing CI and READY Vercel preview prior to merge.

CI recheck: this rebased qualification patch requires successful GitHub Actions and READY Vercel preview before merging; no tests are bypassed.


## 2026-11-06 — Independent InspectorHub sidebar accessibility improvement

Updated the synthetic Inspector Demo green navigation to use flat text links with a visible left-edge active indicator instead of rounded filled buttons. Preserved keyboard focus visibility, clear hover styling and current navigation behavior. Added regression coverage. No production authentication, data, payments or matching changes. CI and Vercel preview required before merging.


## 2026-11-06 — Public homepage demo exploration navigation

The homepage already renders the approved audience order Clients → Inspectors → Agencies. Its prominent Client Workspace and InspectorHub Explore links formerly opened authenticated live routes, which could send unauthenticated demo reviewers to login instead of the synthetic showcase. The Explore links now route to `/demo/client` and `/demo/inspector` with explicit Demo labels; Agency Explore was already synthetic. Intentional live request and registration actions remain separate. Adds navigation/order regression checks. No authentication, database, matching, payment, or sensitive state changes. Complete GitHub CI and Vercel preview READY are mandatory before merge; verify production READY and smoke afterward.
