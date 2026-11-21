# InspectSource development log — 2026-11-21 — Continuous Client sidebar active-section visibility

**P0-B, safe synthetic demo UI:** The canonical single-page Client Demo already caps its sticky blue sidebar height, but selecting or scrolling to lower sections could leave the active Profile/Contracts link offscreen inside that sidebar on short landscape desktops.

The selected link now scrolls into the sidebar viewport as its scrollspy section changes. Only the sidebar scrollTop is adjusted, preserving document scroll, focus, deep links, keyboard navigation, mobile layout and the seven synthetic in-progress inspections. A real Chromium 1024×400 direct-Profile regression checks active highlight, internal sidebar position, link reachability and fictional inspection count; source-level regression contracts supplement it.

No live auth, RLS, privacy, financial, OAuth, matching, migrations or production-data changes. Validate all required CI, synthetic/migration, typecheck, build and browser workflows; require exact-head preview READY before merge and production READY plus smoke afterward.
