# InspectSource development log — November 18, 2026 (Inspector calendar List keyboard)
- Owner priority: Calendar keyboard accessibility within the synthetic, no-login InspectorHub demo. List view shows event dates only; adjacent calendar days may have no focusable row.
- Fix: ArrowUp/ArrowDown navigate distinct listed event dates, Home/End jump to first/last dates, Shift extends a valid <=62-day selection, and focus follows the selected event date. Duplicate same-date events share the same keyboard target. Empty months retain their existing recovery state.
- Preserve Month/Week daily keyboard navigation, assigned inspection Open assignment, privacy of personal titles, no availability writes from navigation, and no OAuth/production records.
- Add source-level guard and hosted Chromium assertions for Nov 18->20, last event Nov 27, Shift+Home to Nov 9, focus and private-event protection.
- Gate before merge: hosted Validate application, Autonomous QA, exact-head Vercel Preview READY. After merge: exact-main Vercel Production READY and production smoke, with no synthetic DB seeding.
- Auth-sensitive PR #288 and production-persistence PR #56 remain separate review-gated workstreams.
