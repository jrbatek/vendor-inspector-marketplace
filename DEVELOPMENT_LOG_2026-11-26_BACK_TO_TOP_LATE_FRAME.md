# November 26, 2026 — Back to top late-frame cancellation

The existing settle callback queued an unconditional two-animation-frame scroll after marking the return finished. User wheel, touch, pointer, key or history events could therefore arrive after settling and be overridden by the queued correction. Cancel that correction on new user intent, replacement activation and unmount; generation guard also rejects an already-dispatched stale callback. Preserve the shared demo-only layout, threshold, reduced-motion behavior and existing browser regression. Three isolated deterministic helper tests and strict helper typecheck passed locally; full checkout still blocked by DNS, require both hosted checks, exact-head Preview READY and exact-main production READY/smoke. The earlier shared audit timeout at the initial scroll-to-top wait is not proven to have this cause. No live data/auth/payment changes.


Hosted validation failed TS2802 at three test MapIterator spreads under ES5. Replaced with Array.from, preserving all assertions. Strict ES5 local compilation and 3/3 deterministic tests passed; full hosted checks required.
