# InspectSource development log — November 18, 2026 (Inspector Calendar List privacy labels)

- Priority 1 Calendar / P0-B control and state consistency: the Inspector Calendar legend and Block Dates select correctly labeled the internal Busy state as **Personal Busy**, but List view rendered the raw internal "Busy" value. This was confusing when the same inspector-only event was viewed across Month, Week and List.
- Scoped demo-only fix: use the existing availabilityLabel() helper for List rows; keep the underlying Busy state, fictional Doctor Appointment / Our Anniversary event titles and client-facing generic Busy privacy barrier untouched.
- Extend hosted Inspector Chromium demo smoke to assert both imported private events display Personal Busy in List and the existing "Inspector only · client view: Busy" legend remains intact.
- Safe, isolated current-main-based branch, independent from Client scrollspy #361 and review-gated route provenance #360, auth #288 and production persistence #56. Require complete CI and Preview READY before merge and production READY/smoke afterward. No live data, OAuth, payment, auth, RLS or production records changed.
