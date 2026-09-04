# InspectSource Development Log

This file is maintained by the autonomous development loop. Keep entries concise and factual.

## 2026-09-04 - Corrected Client Demo entry routing
- Found that the new `Client Demo` CTA still opened `/client-dashboard`, which intentionally blocks unauthenticated users with a login message.
- Routed only the dedicated `Open Client Demo` CTA to the existing `/demo-showcase` synthetic environment so an unauthenticated visitor immediately sees populated demo data.
- Left `Explore Client Workspace` and all authenticated client-dashboard live-data behavior unchanged; this cycle did not alter authentication policy, RLS, matching rules, billing, or production data semantics.
- Added regression coverage requiring the Client Demo CTA to target the synthetic demo route.
- Validate application and Autonomous QA both passed, including regression tests, migration checks, synthetic QA, TypeScript, production build, and smoke tests; the final Vercel preview reached READY.
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
- Added `AUTONOMOUS_DEVELOPMENT.md` with the recurring development protocol and escalation rules.
- Added deterministic synthetic-data generation and QA infrastructure.
- Added scheduled CI validation for synthetic corpus generation and application quality checks.
- Established policy that synthetic data is QA-only and must never be inserted into production.

### Current focus
1. Stabilize the client Request Inspectors workflow across natural language, email, and structured selection.
2. Maintain demo/production parity.
3. Complete Inspector Smart Onboarding persistence after request/matching reliability is strong.

### Product-owner review queue
No decision required to initialize this system.
