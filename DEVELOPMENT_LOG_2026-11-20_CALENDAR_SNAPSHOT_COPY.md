# InspectSource development — November 20, 2026: Calendar baseline date clarity

Safe InspectorHub demo-only usability change. The calendar uses a fixed November 9, 2026 fictional baseline even though the real calendar has progressed. The former "Today · Nov 9 (demo)" button could be mistaken for the actual current date. Rename it "Demo snapshot · Nov 9", update its accessible name and clearly disclose the fixed snapshot in the Calendar introduction. The underlying sample date, private-event visibility, assignments, selection and Week/Month/List behavior remain unchanged.

Existing hosted InspectorHub Chromium navigation checks still exercise the baseline reset; their button locators are updated to match. Added a source contract test protecting the distinction between a fictional baseline and the current date. No live calendar synchronization or OAuth credentials are involved; no authentication, RLS, banking, payment, privacy, production matching or data writes change.

Require all mandatory hosted unit, synthetic, migration, typecheck, build and browser checks and exact-head Vercel Preview READY before merge. Verify production READY and exact-commit smoke afterward.
