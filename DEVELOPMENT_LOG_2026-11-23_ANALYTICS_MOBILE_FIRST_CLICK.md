# InspectSource Development Log — 2026-11-23 · Client Analytics mobile first-click regression

## Independent P0-B browser probe
Expand the existing required Client Analytics hosted-browser smoke to open a *fresh* 390px and 320px mobile document and immediately select Independent as its first source filter action. Assert 15 fictional independent, 45 agency and 60 all-source results; pressed state, no client-side errors or transient Analytics recovery, legible 44px source controls, no horizontal clipping, and accessible native slicers. Prior mobile checks occurred after extensive desktop interaction, which could mask first-click errors in a clean session.

This is test-only additional evidence for tracked intermittent #154, not a claim that the original exception is resolved. The existing continuous Client Demo inspections and login-isolation checks remain intact.

## Safeguards
No production data/auth/RLS/payment/matching changes or synthetic DB writes. Mandatory exact-head CI, synthetic validation, migrations, typecheck, production build and Chromium/Firefox browser tests before merge. Require Vercel Preview READY and production READY/smoke after merging; continue other safe work if this branch fails.
