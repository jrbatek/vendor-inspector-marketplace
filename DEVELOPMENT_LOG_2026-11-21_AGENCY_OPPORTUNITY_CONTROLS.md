# InspectSource development log: 2026-11-21 — Agency opportunity controls

P0-B demo accessibility and adjacent state isolation. Nested Agency Opportunity search, select, reset, detail and interest controls and return navigation link now have at least 44px targets, legible hover/focus/selected/disabled states, and responsive empty-state wrapping.

Search/region/status/discipline changes close obsolete fictional opportunity details and clear stale "interest prepared" messages. Toggling a preview clears its prior interest confirmation. Collapsed previews no longer reference absent ARIA detail elements. Synthetic 24-record fixtures stay unchanged. No live search, authentication, payments, or production data paths modified.

Added direct source-contract tests and hosted Chromium navigation/preview/filter/reset/mobile-target regression; wired to both mandatory CI workflows. Local git clone remains DNS-blocked, so full typecheck/unit/synthetic/migration/build/browser validation must pass in GitHub runners before safe PR merge. Vercel exact-head Preview READY and exact-main production READY/smoke remain release gates. Do not merge if pending or failed.

Independent unresolved work: Analytics #154, Client history #321, and sensitive review-gated PRs #288, #360, #56. No synthetic production database seeding.
