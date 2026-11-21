# Client Analytics P0 accessibility — Source Type / chart targets (2026-11-20)

- Extended the **synthetic Client Analytics only** Source Type segmented controls and selectable chart rows to at least 44px, keeping existing visible selected, hover, disabled and keyboard-focus styles.
- Added hosted Chromium/Firefox checks measuring the actual bounding rectangles after each Source Type cohort transition; also validate controls at 390px on the embedded continuous Client Demo.
- Added source-level regression checks for the explicit sizing and legible states.
- This is an independent P0-B usability hardening, **not a claim that intermittent Analytics crash #154 is fixed**. Do not reintroduce the retired native Source Type selector; its previous interaction caused the crash. Existing 15/45/60 fictional cohort and seven inspection coverage remain in the browser suite.
- Demo-only; no live authentication, RLS, privacy, payment, banking, matching or production database changes.
