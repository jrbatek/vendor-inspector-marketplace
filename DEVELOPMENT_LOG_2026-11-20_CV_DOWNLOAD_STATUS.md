# Client Demo CV download feedback — 2026-11-20

A successful fictional CV preparation previously returned the button to its idle state with no confirmation. The browser now displays an accessible, clearly visible status that the PDF was prepared and the reviewer can check their downloads. Errors remain retryable and are announced as alerts. The button is disabled only while preparing the PDF; sample content, candidate identity and file format are unchanged.

The existing real Chromium Client Demo smoke already verifies that the downloaded PDF has %PDF and %%EOF signatures; new unit/source contracts cover success/error status, contrast and loading semantics.

Scope is demo-only. No bank/payment, production matching, identity/RLS, credentials, database writes, or synthetic production seeding. Pre-merge Validate application, Autonomous QA and exact-head preview READY; post-merge production READY and smoke required. Local checkout DNS remains unavailable, so CI-hosted validation is mandatory before merge.
