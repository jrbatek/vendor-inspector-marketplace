# InspectSource development log — November 17, 2026 (snapshot deadline accuracy)

Safe InspectorHub synthetic-only consistency fix. The dated Open Assignment action register now keeps its historical November 17 snapshot and calculates overdue urgency from six ISO due dates, rather than showing an amber "Awaiting evidence" badge alone for work already past due. The preserved underlying disposition appears as "Overdue · awaiting evidence". Two past-due report milestones no longer claim to be Upcoming. Explicit regression coverage protects the snapshot-date logic. No real workflow, auth, financial records, integration credentials or production matching/database operations changed.

Release gate: Validate application, Autonomous QA, synthetic data/migration/typecheck/build/browser checks and exact-head Vercel Preview READY before merge; production READY and smoke test afterwards.
