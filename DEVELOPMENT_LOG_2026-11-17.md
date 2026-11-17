# InspectSource development log addendum — 2026-11-17

**P0 Client Demo inspection history / issue #321**

On `autonomous/client-inspection-history-fast-actions-nov17`, changed the public synthetic inspection detail navigation to snapshot list filters synchronously before creating a browser history entry. Filter, reset, sort, action owner, keyword, due and NCR controls also persist the next intended state immediately when collapsing details instead of waiting for a React effect. Preserves seven fictional inspections, no-login access, and existing milestones, PDFs, NCRs and filters.

Added `tests/clientInspectionImmediateHistoryNov17.test.ts`; strengthened `scripts/smoke-client-inspections.mjs` to assert immediate history persistence without an effect-polling wait. **Do not close #321 without sustained successful browser validation**; the work addresses one concrete race window but does not prove all intermittent history issues are eliminated.

Mandatory release gates: Validate application and Autonomous QA (synthetic/migrations/typecheck/build/browser), Vercel Preview READY, then sequential low-risk demo merge and production READY plus exact-commit smoke. No production data or sensitive auth/RLS, privacy, banking, payment, or matching changes. This addendum is kept separately because GitHub's contents endpoint does not return the existing 1.68 MB DEVELOPMENT_LOG.md; the original file blob is preserved unchanged.
