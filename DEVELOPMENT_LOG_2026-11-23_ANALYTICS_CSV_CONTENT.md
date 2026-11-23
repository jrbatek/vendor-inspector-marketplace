# InspectSource Development Log — November 23, 2026 · Analytics CSV browser content integrity

## Independent synthetic-only regression
Extend the existing mandatory Client Analytics Chromium smoke after choosing Completed history to read the downloaded CSV bytes from the real browser transfer. Verify required Source Type and Status headers, the downloaded row count matches the UI's filtered total, and all downloaded rows contain Completed status. Previously the browser smoke checked only the filename, which could pass even when the response was empty or wrong.

Preserve the existing 60-row fictional source data, spreadsheet-formula escaping, seven separate active Client Demo inspections, no-login boundary and Client Analytics filter interactions. No actual client records, external integrations, live production writes or banking/payment changes. This follows the safely merged CSV Blob URL lifecycle fix in PR #425; it is not a claimed root-cause fix for intermittent external browser bug #154.

Require mandatory GitHub-hosted unit/fixtures/migrations/typecheck/build/Chromium/Firefox workflows, exact-head Vercel Preview READY, auto-merge only on green, and exact-main Vercel production READY plus smoke test before reporting deployed. Stop for privacy/auth-sensitive changes. 
