# InspectSource Development Log — November 23, 2026 · Back to top navigation interruption

## Scope — low-risk demo-only shared control
The shared `DemoBackToTop` return-to-top timer already canceled on wheel, pointer, touch and scroll navigation keys. However, a reviewer could use Tab/Enter/Escape or an anchor/deep-link or browser Back/Forward during the 900ms smooth-scroll settle window; the pending callback would still force the page to top, overriding the new destination. This patch adds cancellation for those keyboard and history events, including cleanup on unmount.

Expand existing hosted Chromium 1440px Client Demo regression to simulate each navigation type, move to a lower reading position, and assert no stale settle-time snap. Preserve 500px visibility threshold, accessible button, reduced-motion behavior, keyboard focus, mobile safe area, shared demo-only layout and non-interactive live pages.

No live authentication/authorization, RLS, production matching, banking, payment, privacy records, external OAuth, credentials or production synthetic seeding. Local checkout unavailable due DNS; use the connected GitHub Git Data API on exact current main and mandatory GitHub-hosted Validate application, Autonomous QA, synthetic/migrations/typecheck/build/Chromium. Require Vercel Preview READY before merge and production READY plus exact-main smoke after. Do not bypass failing checks.
