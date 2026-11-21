# InspectSource development log — November 21, 2026 — InspectorHub short desktop green navigation

**P0-B:** The single-page InspectorHub's sticky green sidebar has eight clean text links. A short desktop or landscape viewport can clip its lower links because the sidebar has no height cap/overflow.

Fix: Cap the sticky sidebar at viewport height; scroll its contents independently and automatically bring the active scrollspy link into view. Restore natural unconfined layout on mobile <=980px. Preserve no black/navy pills and existing deep links and sections. Add Chromium 1024×400 + mobile regression and a source-level regression test.

Synthetic-only UI. No authentication/RLS, privacy, payments, bank, matching, production fixtures, OAuth or migrations changed. Mandatory CI tests, typecheck, synthetic QA, migration check, build and browser smoke plus READY preview before merge; production READY and smoke afterwards.
