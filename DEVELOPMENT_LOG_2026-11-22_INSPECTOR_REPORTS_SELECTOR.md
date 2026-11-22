# InspectSource Development Log — 2026-11-22 · Legacy Reports exact-region Chromium fix

Initial #415 Autonomous QA failed the new browser check because `getByRole('region',{name:'Work History'})` matched three valid nested regions (`Work History`, `Inspector Work History`, and `Work History filters`). Tightened the intended parent region selector with `exact:true`; no timeout increases or app behavior changes. Full exact-head CI and Vercel Preview READY required before merge.
