# InspectSource development log — November 18, 2026 (continuous Client history)
- P0 Client Demo: preserve only `__inspectSourceClientInspectionList` while navigating Client continuous sidebar sections; legacy `history.pushState(null)` discarded the active fictional inspection-list snapshot and lost filters after refresh from Analytics.
- Keeps no-login `/demo/client`, seven fictional inspections, reports/NCRs, Client scrollspy, deep links and separate live auth boundaries intact. No production records or Supabase writes.
- Updated source-level Client continuous sidebar contract and hosted Chromium regression covering synthetic Kickoff filter → Analytics → reload → Inspections in Progress → Back/Forward.
- Release gate: require Validate application, Autonomous QA, Vercel Preview READY, production READY, exact-commit smoke before recording deployed. Sensitive auth PR #288 and production persistence PR #56 stay unmerged and review-gated.
