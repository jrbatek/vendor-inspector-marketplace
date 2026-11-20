# InspectSource development — November 20, 2026: Named fictional Client Demo CVs

Safe synthetic-only follow-on to merged #371/#372. Client Request Inspectors previews in Natural Language and Structured Selection now display distinct, clearly fictional inspector names alongside stable profile IDs and disciplines. The same names appear in downloadable PDF CVs, with explicit not-a-real-inspector provenance and Agency/Independent source. Availability, eligibility, rates, certifications, work history, downloads and independent preview state stay unchanged. Names are invented personas, not user or inspector records.

Added unit checks for stable name-to-ID mapping and PDF identity/source content, plus browser smoke assertions on the on-screen Client preview. No live inspector data, authentication, RLS, matching, payments, banking, persistence, external credentials or synthetic production DB writes change. Review-gated #288, #360 and #56 remain isolated.

Release gate: Git Data branch creation uses the connected API due to local checkout DNS restrictions. Require GitHub-hosted unit/regression/synthetic/migration/typecheck/build and browser checks, exact-head Vercel Preview READY before merge, then production READY and exact-commit smoke. Never treat pending or action_required as passed.
