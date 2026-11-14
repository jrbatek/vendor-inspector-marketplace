import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";
const src=readFileSync("app/demo/client-agency-sourcing/page.tsx","utf8");
const smoke=readFileSync("scripts/smoke-client-sourcing.mjs","utf8");

test("Source of Inspectors and channel buttons meet 44px touch-target sizing",()=>{
  assert.match(src,/\.seg button,\.channels button,\.independent button\{min-height:44px;/);
  assert.match(src,/\.selectionNotice button\{min-height:44px;/);
  assert.match(src,/\.seg button:disabled,\.seg button\[aria-pressed=true\]:disabled/);
  assert.match(src,/\.seg button:focus-visible/);
  assert.match(src,/\.seg button\[aria-pressed=true\]\{background:#0f172a;color:#fff/);
});
test("hosted Chromium checks mobile tap-target size and a true disabled source style",()=>{
  for (const marker of [
    "Mobile Source of Inspectors control must have a 44px tap target",
    "mobile disabled agency source",
    "Disabled source option did not expose native disabled semantics",
    "Mobile agency channel selection must provide a 44px tap target",
    "Mobile independent channel selection must provide a 44px tap target",
  ]) assert.ok(smoke.includes(marker),marker);
});
