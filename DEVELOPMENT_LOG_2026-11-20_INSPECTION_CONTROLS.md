# InspectSource development — November 20, 2026: Client inspection detail accessibility

P0-B no-dead-controls follow-on for public synthetic Client Demo Inspections in Progress. The seven fictional inspection cards and their optional NCR corrective-action details were rendering aria-controls references to DOM regions that are intentionally not mounted while closed. React now omits the reference when collapsed and sets it only while the corresponding detail region exists; aria-expanded, controls, synthetic milestones, downloadable PDF reports, NCR case content, filters, action queue, navigation and the no-login boundary stay unchanged.

Hosted Chromium regression now checks both collapsed and expanded states for all seven inspection cards and the fictional NCR. Added source-level contract coverage. No production client/inspector records, authentication, RLS, privacy, finance, credentials, persistence, migrations or matching rules changed.

Release gates: mandatory Validate application and Autonomous QA with relevant unit, synthetic, migration, typecheck, build and Chromium checks on exact head; require Vercel Preview READY before autonomous merge, then verify exact merged main production READY and a real production smoke test. Keep sensitive PRs #56, #288 and #360 held.
