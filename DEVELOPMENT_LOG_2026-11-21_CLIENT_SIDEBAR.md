# InspectSource development log — 2026-11-21 — Nested Client Demo sidebar reachability

**Priority:** P0-B, all Client Demo navigation controls remain visible and usable.

The shared dark-blue ClientWorkspaceSidebar used by nested synthetic Client Demo routes was desktop-sticky and content-height sized without its own scroll. At short desktop/landscape heights, links for billing, contracts and profile could extend outside the viewport.

- Constrain only desktop sticky sidebar height and add internal overflow scrolling with containment.
- Restore normal, unclipped flow on responsive mobile layouts (up to 980px).
- Extend the real Chromium Client Inspections smoke on the direct Contracts route to validate 1024×400 sidebar overflow, keyboard-reachable Profile link and unrestricted mobile layout.
- Add source-level accessibility regression coverage and preserve seven fictional in-progress inspections without login.

No real authentication, production data, RLS, payment/banking, privacy, migration or matching changes. Require all mandatory CI checks and preview READY before merge and verify production READY and smoke afterward.
