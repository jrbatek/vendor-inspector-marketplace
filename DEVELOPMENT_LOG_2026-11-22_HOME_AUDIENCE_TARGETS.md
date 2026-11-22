# InspectSource Development Log — 2026-11-22 · Homepage audience links

## Scope
P0-B low-risk shared landing-page usability: preserve Clients → Inspectors → Agencies and all separate live versus fictional demo destinations. Apply minimum 44px vertical targets to primary audience buttons, secondary plain-text links, and explicit fictional demo-entry links. Preserve contrast, hover, visible focus, responsive wrapping and no-login synthetic routes. Add source-level and 1440px / 390px Chromium assertions covering every audience-card anchor.

## Safety and release gate
No production authentication, RLS, payment, database seeding, PII or matching-rule changes. Run exact-head Validate application and Autonomous QA (tests, migrations, synthetic validation, typecheck, production build and Chromium), verify Vercel Preview READY before merge; verify exact-commit production READY and smoke thereafter. Independent of Client Inspection history diagnostic #412; keep unresolved Client Analytics browser exception #154 and history regression #321 open pending causal fixes.
