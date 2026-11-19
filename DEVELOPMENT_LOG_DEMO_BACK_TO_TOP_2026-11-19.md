# InspectSource development log — 2026-11-19 — Global demo Back to top

## Scope and owner priority
Added one reusable, demo-only Back to top control via the `app/demo/layout.tsx` segment layout, covering all Client, InspectorHub, Agency, and nested synthetic detail/search/report routes without changing the production-only shell. The control is absent before 500px of vertical scrolling, fixed bottom right at readable contrast with a 48px touch target, has focus-visible keyboard styling, respects reduced-motion preference, and moves clear of bottom mobile controls/safe-area insets.

## Verification plan and safety
Added deterministic source/coverage tests and real Playwright Chromium checks on every published demo page at 1440px and 390px; check hidden-at-top, hidden-below-threshold, visible-after-scroll, fixed position, focus indicator, Enter activation, hidden-on-return, and reduced-motion mobile navigation. Existing Validate application and Autonomous QA workflows run the full test, synthetic corpus, migration, typecheck, production build and applicable browser smoke steps before merge. No production data, auth/RLS, credentials, financial info or production matching changed. Require exact-head Vercel Preview READY and passed CI before merge, then verify exact-main production READY and smoke.

## Legacy direct email-entry route
The historical `/email-requirements?demo=1` route is also a synthetic demo entry (even though its pathname is outside the `/demo` segment). It reuses the shared control only when its demo query flag is active; ordinary `/email-requirements` remains untouched. The browser audit now exercises both query-flagged and normal email routes on desktop/mobile, affirming no Back to top on the normal live page.

## CI regression correction
The first Autonomous QA run failed only the new Back to top browser check on `/demo/client`: other demo navigation tests had left the scroll control mounted, and React removes it after its next requestAnimationFrame. The assertion read `count()` immediately after scroll returned to zero. The browser check now waits (bounded) for the actual hidden state before asserting the threshold, without weakening visibility or keyboard checks. A fresh exact-head full validation is required.

## CI failure & focused control lifecycle fix
The second Validate application browser run passed `/demo/client` and nested `/demo/client-inspections` but failed smooth keyboard navigation on `/demo/client-analytics`: the Back to top control disappeared at the 500px threshold while still focused, potentially interrupting a smooth-scroll action. The shared component now retains its mounted, focused button until the scroll reaches the top, then hides it. The browser test now captures scroll position, focus, URL, height and control presence on failure so the causal behavior is inspectable; all full CI/browser checks and Vercel gates remain required.

## Scroll anchoring follow-up
Third head CI progressed through Client/Inspector demo routes and failed only at `/demo/agency` after keyboard activation: captured `window.scrollY=44`, active element BODY, and the Back-to-top button already hidden. This establishes that the action reached the top threshold but subsequent DOM focus restoration/scroll anchoring nudged the viewport 44px down. Added accessible landing focus on root main (`tabIndex=-1`, preventScroll) and a post-React two-frame exact-top correction. The main motion remains smooth for standard users and immediate for reduced-motion users. The browser regression still requires scrollY under 8px and does not relax the assertion.

## Focus-preserving scroll settlement (CI follow-up)
Two exact-head browser workflows still failed on long Client Analytics after keyboard activation (33px residual scroll) and sometimes on a detached button during programmatic focus. Root cause: unmounting a focused fixed control triggers browser focus restoration and scroll anchoring. The shared control now remains mounted but is visually hidden, aria-hidden, unfocusable and pointer-inert below threshold; on activation it performs smooth scrolling (or immediate reduced-motion scrolling), then restores focus to the main landmark and clamps residual scroll to zero. The browser threshold/focus/keyboard assertions remain unchanged; both full workflows must pass before merge.

## Preview typecheck correction
Vercel Preview build identified a browser/Node timer typing mismatch (window.setTimeout returns number, while ReturnType<typeof setTimeout> resolved to NodeJS.Timeout). The timer ref now uses number | null. This is a compile correction only; exact-head mandatory validation and Preview READY are still required.

## Browser audit setup correction after timer fix
Hosted Validate at the new component head failed in the source-type Analytics page at the test's focus-style read. Pressing Tab (necessary to create keyboard modality) moved focus to an earlier control and naturally scrolled the dashboard back above the 500px threshold; the Back-to-top control correctly hid, so the subsequent focus-style assertion had no visible target. The browser smoke now returns to its explicit 850px position **after** Tab and waits for the control to become visible again before focusing. Threshold and keyboard/focus assertions remain unchanged; neither failure was waived.
