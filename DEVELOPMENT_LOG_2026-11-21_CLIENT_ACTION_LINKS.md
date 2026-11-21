# InspectSource development log — 2026-11-21 — Client inspection action/report links

**P0-B safe synthetic Client Demo UX.** The seven fictional inspections and their Open Inspection details are established; however several related inline anchors (action register Open Inspection, action export CSV, list CSV, and sample PDF reports) offered smaller-than-touch-friendly link targets despite otherwise readable colors and focus states.

Give these functional anchors 44px minimum targets while retaining visible hover, focus, synthetic identifiers, download behavior and responsive wrapping. Add source-level regression checks plus real Chromium action/PDF link geometry assertions within the existing no-login seven-inspection browser smoke.

Require CI synthetic/migration/typecheck/build/browser validation, preview READY, sequential merge and production READY/exact-commit smoke. Scope is styling and regression checks only; no real authentication, RLS, financial, matching, OAuth, migrations or production data writes.
