# InspectSource Development Log — 2026-11-22 · Client Inspection Back/Forward regression #321

## Scope
The existing public Client Demo Chromium history smoke now repeats three additional Back/Forward round trips between fictional DEMO-ACT-4 details and the one-row Kickoff filtered list. Each pass asserts the exact seven-versus-one inspection counts, reset versus selected stage, detail visibility, and absence of login-required shell. Existing history checkpoints capture URL, history length, stored filters and expanded controls on each cycle for intermittent-failure diagnosis.

## Guardrails
This is P0-A **test-only** work. Do not raise timeouts to hide a race. No production auth, RLS, privacy, banking, commercial rules, or synthetic/live data changes. Keep #321 open until a cause is diagnosed and a regression fix validated. Run mandatory exact-head Validate application and Autonomous QA (synthetic, migrations, typecheck, build, real Chromium), Vercel Preview READY before merge, then production READY and exact-commit smoke. GitHub-hosted runner used because local checkout DNS remains restricted.
