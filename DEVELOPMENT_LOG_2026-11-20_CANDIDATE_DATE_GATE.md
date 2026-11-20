# Client Demo candidate availability gate — 2026-11-20

## P0 demo integrity improvement
Natural Language Preview previously offered fictional CVs as "available" without requiring an inspection start date. A missing date cannot be checked against any inspector's known availability window, and the shared parser also accepts impossible ISO calendar dates. The preview now requests a real explicit start date before displaying available fictional candidates, and the shared demo matching function fails closed on absent/impossible starts.

- Synthetic roster remains local and unchanged; default December 7, 2026 Houston sample still returns two fictional candidate CVs.
- The browser displays a date-specific explanation rather than presenting unverified availability.
- Existing no-date match assertions were replaced with fail-closed assertions. Added tests for missing dates, impossible days and valid date behavior.
- No effect on live matching, actual inspector availability, payment, authentication, privacy, calendar OAuth or production persistence.

## Release gate
Before merge require Validate application and Autonomous QA success on exact PR head, Vercel Preview READY, review changed paths and no production data writes. Confirm production READY plus exact-commit smoke after merge. Do not merge while CI or preview is pending/failed.
