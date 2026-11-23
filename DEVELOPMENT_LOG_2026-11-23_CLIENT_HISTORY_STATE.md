# InspectSource Development Log — 2026-11-23 · P0-A Client Inspection history hardening

## Change
The public Client Demo inspection list now normalizes its browser-history snapshots on Back/Forward and initial mount. Missing, partial or malformed older entries reset to a clean seven-record fictional list, rather than inheriting filters from a different history entry. Known synthetic stage/project/inspector/action-owner values, valid ISO dates, sort, flags and bounded search text survive restoration. A current valid saved filter state is preserved unchanged.

This is a defensive fix for a specific stale-state path related to tracked intermittent history regression #321; it is **not** a claim that the independent Chromium flake has been fully reproduced or resolved. Preserve the existing real-browser repeated Back/Forward regression and issue tracking until evidence supports closure.

## Safety / release
Synthetic client UI state only. No auth, RLS, production searches, payment, privacy, persistence or database edits; no synthetic production seeding. Required GitHub-hosted checks: unit/integration, migration validation, synthetic-data validation, typecheck, build, Chromium, Autonomous QA and exact-commit Vercel Preview READY before merge. Verify production READY and smoke before declaring deployment. Local checkout remains blocked by DNS; do not use Vercel as a debugging environment.
