# InspectSource Development Log — 2026-11-22 · Agency affiliation controls

## Scope
P0-B, safe synthetic demo-only style/accessibility patch. On `/demo/agency-affiliations`, the claim preview and six lifecycle status filters now preserve 44px touch targets, distinct unselected/selected/expanded/hover/focus/disabled states, and readable contrast. The return-to-Agency link is keyboard-focusable with a 44px target.

## Safety
No changes to agency membership, verified-affiliation logic, client routing, production authorization/RLS, matching, persistence, credentials or PII. No synthetic production database writes.

## Required release gate
Run `npm test`, `npm run check:migrations`, `npm run qa:synthetic`, `npm run typecheck`, `npm run build`, and Autonomous QA on the exact PR head in GitHub-hosted CI. Require exact-head Vercel Preview READY before merge, then exact-commit Production READY and smoke after merge. Local container GitHub DNS is inaccessible; do not claim local tests were run.

## Follow-on
Continue P0-B audits on independent Inspector affiliation view and other shared/nested demo controls. Keep sensitive live-route PRs isolated for review.
