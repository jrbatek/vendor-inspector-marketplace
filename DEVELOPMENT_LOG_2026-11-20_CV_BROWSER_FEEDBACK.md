# Fictional candidate CV download browser regression — 2026-11-20

Follow-on to merged PR #385. The earlier code-level assertions now have a real Chromium download-flow assertion: after verifying the downloaded file's PDF header/footer, the browser must observe a visible `role=status` message confirming that the fictional CV was prepared. The message must retain legible dark-teal text, and the existing download filename/file-validity tests remain intact. This catches an inaccessible or invisible response even if React state or CSS changes in later demo work.

Demo-only Playwright regression; no production data, auth/RLS, bank/payment, API integration, or marketplace matching logic changed. Local DNS checkout remains blocked; require Validate application + Autonomous QA + exact-head Vercel Preview READY before merging and exact-commit production READY/smoke afterward.
