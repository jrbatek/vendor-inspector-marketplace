# InspectSource development log — November 21, 2026 — Client Data Controls

P0-B: Expanded 44px minimum touch-target coverage to the public synthetic Client Data & Integrations Demo, including CSV and JSON exports, copy-example API button, status selector, and reset action. Added distinct legible primary/secondary hover states, preserved focus outlines and disabled contrast. This is a demo-only UI adjustment: no live API, financial, auth or production data changes.

Regression: Added source contract and extended existing Chromium desktop (1440px) and narrow mobile (390px) smoke to check actual control geometry alongside functional JSON download and five-record filter reset. Mandatory CI validation (tests, synthetic, migrations, typecheck, build, Chromium) and Vercel preview READY must pass before merging. Verify exact-main production READY/smoke afterward. No synthetic records seeded into production.
