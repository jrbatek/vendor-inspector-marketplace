# Client Demo completion-date integrity — 2026-11-20

Natural Language inspector CV preview already requires a valid start date. Extend the same truthful availability gate to an explicitly stated inspection **end date**. JavaScript Date.parse silently rolls November 31 to December 1, and February 30 to March 2, which could wrongly represent a requested unavailable period as a real one. A malformed explicit end now triggers an actionable error before displaying fictional candidate availability; valid real inclusive dates keep their prior behavior.

- Client Demo matching and preview only; no changes to live inspector matching, scheduling, privacy, authentication, payment, banking or production persistence.
- New unit and real Chromium browser regression cases for invalid end dates and preserved valid end dates.
- Mandatory pre-merge: both hosted validation workflows and matching Vercel Preview READY; no failed or pending checks may be merged.

## CI failure correction on exact PR head
Both Validate application and Autonomous QA failed the new strict-end test for `2026-11-31`: the shared request parser preferred the invalid ISO completion date over the valid named start date, reporting a **start**-date error. Fixed in synthetic Client Demo only by excluding explicitly labeled completion dates from the shared start-date parser while separately validating the completion day. Added ISO-start/ISO-end regression examples. No production parser or matching rules changed. Re-run all mandatory gates before merge.
