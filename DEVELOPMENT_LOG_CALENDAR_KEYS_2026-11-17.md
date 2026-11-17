# InspectSource development log — November 17, 2026 (Calendar keyboard shortcuts)

Safe synthetic-only enhancement: Month and Week date-picker buttons now support Home/End for Sunday/Saturday and PageUp/PageDown for adjacent months, with focused date preservation. Page navigation preserves the date number when possible and clamps at short month-end dates. Holding Shift extends the selected range from its existing anchor. Keyboard navigation never updates inspector availability, external calendars, or any database. Browser/contract coverage asserts focus, selected dates, and no implicit calendar writes.

Build/release gate: PR must pass Validate application, Autonomous QA (Chromium + Firefox, migration/synthetic/typecheck/build), and Vercel Preview READY before merge. Production READY plus smoke testing required afterward. Sensitive auth/persistence PRs #288 and #56 remain separate and unmerged.
