# November 28 — Income text sample snapshot and browser verification

All fictional downloadable text documents (assignment earnings, work verification, income preview, and completed-year 1099-NEC/W-2 informational summaries) now carry the exact same immutable synthetic snapshot timestamp as the dashboard, CSV and PDF. Hosted Chromium smoke checks actual bytes, filename, selected year, fixed snapshot, disclaimer and expected document counts across 2024–2026. No real financial records or payment logic touched. Local source preflight passed; full hosted validation and exact-head Vercel Preview READY required before merge.


Both hosted workflows failed at the text download event timeout after 2026 completed. A local Chromium reproduction confirmed the 11th rapid download on one document is suppressed; fresh-page per-year sessions successfully exercised 8, 9 and 8 downloads. This is a harness isolation fix, not a weakening of actual file content checks or proof of a production download defect. Exact-head hosted revalidation required.
