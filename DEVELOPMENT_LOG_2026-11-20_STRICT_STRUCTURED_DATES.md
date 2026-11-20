# InspectSource development — November 20, 2026: Reject invalid Structured Selection calendar dates

Safe demo-only validation improvement. The Structured Selection candidate preview previously used Date.parse() without verifying day/month fidelity. JavaScript can normalize nonexistent dates (such as February 30), potentially producing misleading fictional availability. The new strict UTC calendar-day check rejects impossible or malformed dates before invoking the existing synthetic-only inspector eligibility matcher; valid ISO dates, including leap days, continue to parse correctly. Does not broaden roster or invent a production candidate. Browser input still uses native date field.

Added explicit negative and leap-day unit tests to the existing Structured Selection regression suite. The default Houston candidate roster and PDF CVs remain unchanged. No live production matching, personal records, authentication, RLS, payments, banking, OAuth credentials, persistence or synthetic data writes.

This branch was cut from verified main after #373 and intentionally does not overlap Calendar UI #374; rebase/revalidate in sequence after that PR ships. Mandatory hosted tests, migrations, synthetic validation, typecheck/build/browser smoke, exact-head Preview READY before merge, production READY and exact-commit smoke after merge.
