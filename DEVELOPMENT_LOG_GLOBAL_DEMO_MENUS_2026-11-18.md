# InspectSource development log — 2026-11-18 — Global demo menu browser regression

Priority: P0-A demo/live routing isolation. Enhanced the mandatory real Chromium
demo control smoke to open the actual rendered global Clients, Inspectors and
Agencies menus from each of the three public demo experiences at desktop (1440px)
and mobile (390px) widths. Assert every actionable destination in those global
audience menus remains on a `/demo/` route; the intentional global Login control
is outside the menu and not mistaken for a demo link.

This is regression coverage only, no live auth/RLS changes or production data
mutations. Checks run as part of both pre-merge Validate application and
Autonomous QA, together with typecheck, synthetic data validation, migrations,
production build and browser smoke. Owner-authorized low-risk demo UX release.

Client Inspections in Progress continues to show seven clearly fictional
inspections with detail, PDF, NCR, milestone and action controls without login.
