# InspectSource development log — November 19, 2026 (Calendar assignment actions)
- Priority: InspectorHub Availability & Calendar and P0 visibility of usable controls. Month, Week and List had undersized nested Open assignment buttons with no project-specific hover context.
- Add consistent 44px minimum-height assignment actions, bounded widths and wrapped labels for the narrow, horizontally scrolling Month grid; keep existing accessible button text and assignment navigation.
- Provide project-specific action title for sighted reviewers and preserve all synthetic assignment data, privacy classifications and browser-only demo behavior.
- Expand hosted Chromium regression to verify actual button geometry on desktop (1440px) and narrow mobile (390px), plus Week/List target sizes and contextual titles. Add unit source contract.
- Required release gates: unit/regression, synthetic-data validation, migration scan, typecheck, production build, Chromium/Firefox, exact-commit Vercel Preview READY before merge; production READY/smoke after merge. No production data or security/auth changes.
