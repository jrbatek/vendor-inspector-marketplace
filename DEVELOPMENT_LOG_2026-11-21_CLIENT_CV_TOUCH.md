# InspectSource development log — November 21, 2026 — Client candidate CV controls

Independent P0-B safe demo-only batch. The Client Demo fictional candidate CV disclosure now provides a 44px minimum click/touch target, legible open/hover states and a visible focus outline; its PDF download button keeps a legible disabled/loading state and suppresses hover styling while disabled. Existing fictional candidate data, selection filters, PDF generation and result announcements stay intact.

Regression: New source-contract tests plus pre-existing mandatory Chromium CV download tests and global desktop/mobile demo-control scan. Require both CI validation workflows, synthetic checks, migrations, typecheck, build and Vercel preview READY prior to merge; production READY and exact-commit smoke after. Built independently from current main while Agency contracts PR #401 validates. No live auth, production data, payment or matching changes.
