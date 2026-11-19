# InspectSource development log — November 18, 2026 (Calendar connection touch targets)

- Priority 1 Availability & Calendar / P0-B accessibility: preserve compact three-column demo-only provider controls on desktop, with consistent minimum 44px pointer/touch targets and existing readable hover/focus and selected/unselected states. Narrow-screen layout continues to use single-column wrapping.
- Added hosted Chromium assertions to check all three controls' rendered heights and common desktop row alignment. Existing synthetic-only Google/Outlook/Other toggles and session status remain unchanged; no OAuth or live credentials.
- Isolated from Client scrollspy #361 and review-gated auth/data-provenance #360, #288, #56. Follow mandatory validations, exact-head Preview READY, merge, exact-commit production READY and smoke test. No DB migrations or production data changes.
