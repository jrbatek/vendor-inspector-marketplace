# November 26, 2026 — Public Client preview hydration guard

PR #441's earlier Validate application failed waiting for Candidate CVs after a single click. A pre-hydration click is a plausible but unproven cause. Gate both synthetic preview buttons until the page effect runs; provide legible disabled styling and report request/status/heading diagnostics on the real first-click regression failure. Do not retry or weaken that assertion. Local GitHub DNS failed; authorized hosted checks required before merge. No live matching, auth or data changes.
