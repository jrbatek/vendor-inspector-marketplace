## 2026-11-21 — InspectorHub opportunity dialog short-screen usability (P0-B)

- On small mobile or short landscape viewports, constrain the fictional Opportunity Preview modal to the available viewport width and height; allow internal vertical scrolling so Accept / Request more information / Decline remain reachable.
- Preserve the 44px close target, focus behavior, exact offered day rate and synthetic-only action handling.
- Extend hosted Chromium InspectorHub smoke to check 390×640 and 320×400 viewports, decline button reachability and scrolling; add an explicit source regression test.
- Scope: demo UI only; no live authentication, RLS, payments, bank, privacy or production matching/data changes. Validate CI and Vercel preview READY before any merge; production READY and smoke after merge.

