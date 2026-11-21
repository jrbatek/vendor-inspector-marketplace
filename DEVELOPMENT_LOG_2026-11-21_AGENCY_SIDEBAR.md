# InspectSource development log — 2026-11-21 — Short desktop Agency sidebar

**Priority:** P0-B, all controls remain visible and reachable.

The purple Agency Workspace sidebar was sticky and height-constrained without its own overflow. On shorter desktop/landscape screens the last of seven links, including Contracts & Commercials, could fall below the viewport.

- Make only the Agency sidebar scroll internally when its links exceed the available height.
- Keep the single active scrollspy link inside its sidebar viewport as long-page content scrolls, without scrolling the main page or changing focus.
- Preserve existing responsive mobile layout, seven sections, synthetic privacy boundary and deep-link/history behavior.
- Add regression contract and Chromium short-viewport geometry, last-link reachability and active-label tests.

Demo-only changes. No production authentication, RLS, privacy, banking/payment, matching, database fixtures or migrations modified. Mandatory CI plus Vercel preview READY before merge; production READY and smoke afterward.

## CI follow-up — guard smooth-scroll active link

The first rebased QA run failed its actual Chromium short-screen navigation assertion: after clicking Contracts & Commercials, the active scrollspy link temporarily switched back to Overview during the smooth scroll. Fixed the underlying state race by retaining a requested sidebar target until the scroll reaches the reading threshold, while releasing on manual wheel/touch/scroll-key navigation. The smoke now rechecks active Contracts after an intermediate animation frame. Re-run all gates; do not merge the failed head.
