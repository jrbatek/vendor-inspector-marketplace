# InspectSource development — November 19, 2026: Structured Selection candidate CVs

Safe demo-only follow-on to merged PR #371. Structured Selection preview now displays the same functional fictional inspector CV cards and PDF downloads used by Natural Language, sourced exclusively from the browser-local sample roster. Geography, credentials, experience, start day and fictional Agency/Independent channel all filter the results. The preview clearly discloses that only the start day is checked; users must use Natural Language to specify full assignment duration.

The two preview surfaces have distinct accessible IDs. Editing any structured field invalidates stale CVs and the criteria summary; reset clears both. Unsupported geography and invalid input return no candidates rather than fabricating live coverage. No real matching, authorization, persistence, credential handling, or production database writes change.

Required before merge: hosted unit/regression/browser tests, synthetic-data validation, migration checks, TypeScript and production build, then exact-head Vercel Preview READY. Require exact merged-main Vercel Production READY and post-release smoke before claiming deployment. Hold existing authentication-sensitive PR #288, provenance PR #360 and production-persistence PR #56 for security review.
