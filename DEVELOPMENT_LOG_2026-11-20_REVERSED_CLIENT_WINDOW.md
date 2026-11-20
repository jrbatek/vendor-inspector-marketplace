# Client Demo reverse completion-date guidance — 2026-11-20

Fictional Natural Language candidate matching excluded inspector CVs when a stated end date was earlier than the start, but the reviewer received only a generic empty result. The Client Demo now explains that the **end date must be on or after the start date** before attempting availability matching, with valid same-day requests preserved. Covers named and ISO dates, and adds a real Chromium preview-flow check.

- Synthetic candidate roster, rates and documents unchanged.
- No live search, production matching, authentication, RLS, production persistence or personal data changed.
- Do not merge until Validate application, Autonomous QA and exact-head Vercel Preview READY; verify production READY and matching smoke afterward.
