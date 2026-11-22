# InspectSource development log — November 18, 2026 (legacy structured demo provenance)

- **Review-gated P0 demo/live boundary** tracked by issue #359. Old `/inspectors?demo=1` displayed a "Synthetic data" banner yet mounted `InspectorFilterPage`, which queries live Supabase inspector data. This is code-level misleading provenance, not a finding of actual unauthorized data exposure.
- Add a server-side redirect **only** for `?demo=1` to no-login `/demo/client#structured-selection`, which is purely fictional. Keep ordinary `/inspectors` and its production search and auth policies unchanged. Demo fixture data remains in the client bundle; no Supabase writes or production seeding.
- Add a source contract and hosted Chromium redirect/no-live-diversion regression to existing Client Demo smoke, preserving seven fictional inspections and no-login details/filters.
- **Do not autonomously merge this PR**: it changes classification of a public URL previously serving live-backed data and therefore needs explicit owner security/data-provenance review. Passing CI and Preview READY do not remove that gate.
- Independent low-risk Calendar List accessibility PR #358 was merged after required checks and Vercel Preview READY; production smoke and production READY are tracked separately.
