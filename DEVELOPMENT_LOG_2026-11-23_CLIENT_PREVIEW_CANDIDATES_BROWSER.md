# InspectSource development log — November 23, 2026 · Client Demo candidate/CV preview

## Owner-reported usability regression: Preview request must display inspectors and CVs

In public Client Demo `/demo/client`, the Natural Language – AI "Preview request (demo)" and Structured Selection "Preview selected criteria" must display the fictional candidate roster, not a blank pane or production-login shell. The seeded Houston API 570 December 7 request and default structured criteria are each expected to show exactly two fictional inspectors, Avery Calder and Maya Ellison.

Extend the real hosted Chromium browser control smoke at 1440px and 390px to submit both preview actions, assert visible candidate cards/names and a functional View CV expansion with assignment history. At desktop width, click Download CV (PDF), verify the candidate-specific sample filename and actual PDF header bytes. Preserve the seven separate fictional Inspections in Progress, the continuous Client Workspace and all current request/CV controls.

No synthetic record is written to the production database. This test invokes no real matching, authentication, payment or external API integration. Required release gates: exact-head Validate application and Autonomous QA, synthetic/migration/typecheck/build/Chromium checks, Vercel Preview READY, safe sequential merge and exact-main production READY + smoke pass. Do not merge pending/failed checks.
