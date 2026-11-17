# InspectSource development log — 2026-11-17 (disclosure visibility)

- Priority P0-B: invisible/blank controls across Client, Inspector, Agency and shared synthetic demo surfaces.
- Audit gap: the existing desktop/mobile Chromium visible-control scanner selected buttons, links, inputs, selects, textareas, and role=button, but omitted native HTML `summary` disclosure triggers. They can be actionable, named, and visible even while associated `details` content is collapsed.
- Expanded the same scanner to include `summary`, preserving foreground/background/opacity/name checks, browser exception capture, route coverage and mobile viewport. Added a source-level test preventing accidental removal of disclosure coverage.
- Safety: pure QA guard, no runtime UI or production auth/payment/RLS/PII/data/matching changes, no production data writes.
- Require both GitHub-hosted Validate application and Autonomous QA and exact-head Vercel Preview READY before any merge, then production READY/smoke; do not use Vercel as a test debugger.
