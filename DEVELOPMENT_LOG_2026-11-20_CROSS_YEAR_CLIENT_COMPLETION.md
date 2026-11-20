# Client Demo yearless cross-year completion — 2026-11-20

Synthetic Natural Language inspection requests such as **starting December 29, 2026 through January 5** previously interpreted the yearless January completion as January 2026 and incorrectly warned that the end preceded the start. The demo-only scope normalizer now inherits the prior named or ISO start year and advances the end year when the month rolls back across New Year. Completion dates explicitly carrying a year and backwards day-of-month requests remain unchanged and still receive invalid-window guidance.

Regression coverage includes unit tests for named, ISO and entirely yearless starts, explicit-year rejection, and a real Chromium Client Demo Preview request returning the fictional Maya Ellison CV for December 29–January 5. No production search/matching, authentication, RLS, database, banking or PII changes; no synthetic seed writes.

Release safeguards: use CI-hosted Validate application (tests, migration, synthetic, typecheck, build) and Autonomous QA (browser smoke), exact-head Vercel preview READY before merge; production READY and smoke after. Local checkout still blocked by container DNS; do not interpret CI as locally executed.
