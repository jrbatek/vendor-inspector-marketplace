# InspectSource development log — 2026-11-21 — Interruptible demo Back to top

**P0-B shared synthetic demo usability.** The floating Back to top control previously scheduled an unconditional final snap to page top after a smooth scroll. If a reviewer wheeled, touched, clicked or used scrolling keys during that return, the old timeout could unexpectedly hijack reading position 900ms later.

Cancel that pending snap when user-initiated scrolling/navigation interrupts the return, while preserving the 500px appearance threshold, keyboard access, focus restoration after uninterrupted returns, motion preferences, mobile safe areas, and demo-only route coverage. Add real Chromium interruption behavior to the existing demo control browser smoke and source regression coverage.

All mandatory CI checks, preview READY, production READY and exact-commit smoke remain required. No live auth/RLS/payment/production data changes or synthetic DB seeding.
