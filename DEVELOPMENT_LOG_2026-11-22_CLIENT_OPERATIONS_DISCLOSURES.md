# InspectSource Development Log — 2026-11-22 · Client Operations disclosure references

## Scope
P0-B Client Demo regression: Billing invoice and Contract disclosure buttons now advertise `aria-controls` only while their corresponding synthetic detail panel exists; collapsed rows no longer reference absent DOM nodes. Contracts relationship tabs also point to the currently mounted panel only. Existing actual Open details, tab keyboard navigation, synthetic invoice balances, and single-page embedded Client workspace are unchanged.

## Safety
Presentation/ARIA only. No live billing, payment, bank, contract signing, account mutation, authentication, RLS, privacy or synthetic database write. No changes to production commercial rules.

## Verification
Dedicated source regressions plus all mandatory exact-head GitHub-hosted Validate application and Autonomous QA, including migration, synthetic, TypeScript, build and Chromium. Vercel Preview READY before merge; production READY and exact-commit smoke afterward. Local checkout DNS remains blocked.
