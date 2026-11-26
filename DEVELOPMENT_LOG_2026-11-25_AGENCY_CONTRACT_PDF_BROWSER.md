# November 25, 2026 — Agency contract PDF browser verification

Verify all three actual browser-downloaded fictional agreements with pdf-lib: PDF signature, exact agreement-specific filename and title, one page, and explicit fictional/non-binding metadata. Check that status stays on the latest agreement. Existing detail and mobile checks remain. Tests only; no live contracts, financial records, legal acceptance, auth or production data changes. Hosted validation fallback; require both exact-head workflows and Vercel Preview READY before merging, then exact-main production READY and smoke.
