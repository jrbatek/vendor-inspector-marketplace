# InspectSource development — November 20, 2026: Descriptive Client Demo CV filenames

Safe usability follow-up to merged named fictional candidate preview PR #373. Downloaded PDF CVs now include the fictional inspector's sanitized display name and stable synthetic inspector ID in the filename (e.g., InspectSource-Avery-Calder-IS-1042-demo-CV.pdf). This helps a client reviewer distinguish multiple candidate resumes after download. The PDF bytes, candidate details, eligibility, sources, availability, rates, permissions and download behavior are otherwise unchanged.

Hosted Chromium smoke now verifies the downloaded filename contains the matching fictional name and ID; source-level contract test prevents regression. No production inspector data, real personal data, authentication, RLS, payment, bank, persistence, external credentials or production matching change.

Branched independently from #374 merged main and does not overlap #375 Strict Structured Selection dates; revalidate on latest main before merging. Require GitHub-hosted tests, synthetic validation, migration checks, typecheck, production build and browser smoke; exact-head Preview READY before merge, exact-commit production READY + smoke after.
