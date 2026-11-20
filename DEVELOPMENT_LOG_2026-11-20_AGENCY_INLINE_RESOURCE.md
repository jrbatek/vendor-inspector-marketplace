# Agency resource detail preview immediately alongside the selected profile — 2026-11-20

The full fictional Agency resource search used to render the clicked inspector's preview only **after all 25 cards**. For the first card, selecting “View fictional resource” appeared to do nothing because details were far below the viewport. The preview now expands within the selected resource card, near the initiating button. Its accessible expanded state and conditional target are kept in sync, and the existing Close preview control closes it without scrolling to the bottom.

- The 2,823 synthetic resources, five featured profiles, search facets, pagination, responsive layout and full privacy/disclosure copy are unchanged.
- Browser QA opens and closes the inline detail and checks no dangling ARIA target remains.
- No live inspector lookup, real CVs, auth, payment, bank, RLS, external API or database write was added.
- Exact-head GitHub Validate application and Autonomous QA, matching Vercel Preview READY, then main production READY and smoke are required before reporting released.
