# InspectSource development log — November 17, 2026 (P0-B Calendar button focus)

Independent visual-accessibility correction: replaced the pale turquoise generic Inspector Calendar button focus outline (#5eead4) with high-contrast dark teal (#115e59), three-pixel ring, three-pixel gap and white separation. This applies to the Calendar navigation, view tabs, Block dates, calendar connection controls and Open assignment buttons. Existing date-picker-specific focus rings remain and all demo data/behavior are unchanged. Added source-level P0-B regression assertions. No auth, payments, live availability or production DB changes.

Require both mandatory exact-head CI workflows, synthetic/migrations/typecheck/build and browser smoke, then Vercel Preview READY before merge and production READY plus exact-commit smoke afterward.
