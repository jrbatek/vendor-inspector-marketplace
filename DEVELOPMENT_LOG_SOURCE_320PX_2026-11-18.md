# InspectSource development update — 2026-11-18 · Narrow-phone sourcing controls

## P0-B regression coverage
- Extended hosted Chromium Client Demo Source of Inspectors smoke down to 320px-wide phones (previously 390px and 768/1024px).
- Check that all agency/independent/both selectors retain 44px touch targets, contrast and hover visibility without horizontal clipping.
- Check agency channel buttons at 320px, isolated source selection changes, reset to all four fictional inspectors and absence of client-side exceptions.
- Added a focused test contract for the exact built-app smoke coverage and existing responsive/disabled/selected styles.

## Scope/release
Synthetic demo visual regression only. No auth, PII, banking, payments, production matching, OAuth, data inserts or migrations.
Required checks: unit/test, migrations, synthetic QA, TypeScript, build, hosted browser smoke, Vercel Preview READY; production only after exact checks green and READY/smoke.
