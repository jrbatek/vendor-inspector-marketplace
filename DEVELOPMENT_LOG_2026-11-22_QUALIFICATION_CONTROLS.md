# InspectSource development log — November 22, 2026 — Qualifications & Documents accessibility

P0-B safe synthetic-demo-only improvement. The inspector's qualification evidence form, PDF/image sample file selector, recommendation source links, document actions, modal actions and disabled loading states now have consistent >=44px target sizing, legible foreground/background combinations and clearly visible keyboard focus. Responsive input sizing prevents narrow-screen overflow. Functional upload validation, no-real-upload boundary, in-page sample documents, verification status, official qualification links and InspectorHub continuous scroll/navigation remain unchanged.

Added a focused unit source-contract and live Chromium assertions for rendered control dimensions in the inline InspectorHub Qualifications section. Require both GitHub mandatory CI workflows (tests, synthetic-data validation, migration check, typecheck, production build and browser QA), Vercel Preview READY prior to merging, then production READY and exact-commit smoke test. Do not use Vercel as the debugging loop.

No auth/RLS/privacy, production matching rules, payments/bank data, production records, external OAuth credentials or migrations modified. DEVELOPMENT_LOG.md original preserved; dated addendum used because legacy full log exceeds GitHub contents API text return limits.
