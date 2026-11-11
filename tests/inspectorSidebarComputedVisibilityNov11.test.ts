import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const inspector=readFileSync("app/demo/inspector/page.tsx","utf8");
const smoke=readFileSync("scripts/smoke-demo-control-visibility.mjs","utf8");

test("InspectorHub green sidebar uses text-only navigation with accessible active focus and hover",()=>{
  assert.match(inspector,/\.side nav button\.sidebarTextLink:not\(:disabled\)\{[^}]*background:transparent!important/);
  assert.match(inspector,/\.side nav button\.sidebarTextLink\.active:not\(:disabled\)/);
  assert.match(inspector,/\.side nav button\.sidebarTextLink:hover:not\(:disabled\)/);
  assert.match(inspector,/\.side nav button\.sidebarTextLink:focus-visible:not\(:disabled\)/);
  assert.match(smoke,/P0-B: real computed InspectorHub sidebar links must remain readable/);
  assert.match(smoke,/Default InspectorHub sidebar link/);
  assert.match(smoke,/Active InspectorHub sidebar link/);
  assert.match(smoke,/Hovered InspectorHub sidebar link/);
  assert.match(smoke,/Focused InspectorHub sidebar link/);
  assert.match(smoke,/InspectorHub sidebar click failed to show embedded Work History/);
});
