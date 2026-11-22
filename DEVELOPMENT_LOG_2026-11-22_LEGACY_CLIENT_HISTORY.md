# InspectSource Development Log — 2026-11-22 · Legacy Client History redirects

## Product behavior
The owner-approved one-page Client Demo places completed/historical inspection intelligence under Analytics and current inspections under Inspections in Progress. The leftover public `/demo/client-history` route was still rendering an obsolete standalone history shell. It now redirects old bookmarks to `/demo/client#analytics`, preserving `?view=active` bookmarks as `/demo/client#inspections-in-progress`. Both destinations use fictional data and no login.

## Validation and safeguards
Update legacy route contract tests; extend real Chromium Client Inspections smoke to check redirect path/hash, seven synthetic inspections and absence of login shell for three bookmark forms. No live route, credentials, authentication, RLS, payments, production database, PII or commercial matching changes. Mandatory exact-head CI (tests, synthetic data, migration checks, typecheck, build, browser smoke) and Vercel Preview READY before merge; production READY and exact-commit smoke after. Independent of homepage link-size work #413 and intermittent issues #154/#321, which remain open.
