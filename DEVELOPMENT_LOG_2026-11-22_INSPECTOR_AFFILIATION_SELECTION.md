# InspectSource Development Log — 2026-11-22 · Inspector affiliation claim selection

## Scope
P0-B/demo UX: Pending & Disputed affiliation cards can now be explicitly selected; confirmation, correction and dispute actions remain visibly disabled until a synthetic claim is selected. Preview feedback identifies the actual selected fictional agency and resource ID. Moving among Current, Pending and History, or selecting another claim, clears outdated action messages. Adds legible selected, disabled, hover and keyboard focus states and 44px controls.

## Safety and boundaries
Entirely local demonstration state. No agency claims are persisted, no verification or matching rules changed, no real notifications sent, no PII/production authorization/RLS touched. Prevents the misleading 'Confirm selected claim' action when no claim was selected.

## Validation and release
Require GitHub-hosted application, migration, synthetic QA, typecheck, build and Autonomous QA success at exact head, Vercel preview READY before merging, production READY and exact-commit smoke afterward. Local checkout is blocked by DNS, not waived.

## Next
Continue auditing remaining Client/Inspector/Agency demo controls, and separately track review-gated live changes.
