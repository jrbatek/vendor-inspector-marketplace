import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const sidebar=readFileSync("components/ClientContinuousSidebar.tsx","utf8");
const smoke=readFileSync("scripts/smoke-client-analytics.mjs","utf8");

test("Client continuous sidebar collapses on narrow screens with accessible controls",()=>{
  assert.match(sidebar,/const \[mobileOpen,setMobileOpen\]=useState\(false\)/);
  assert.match(sidebar,/aria-controls="clientContinuousSections" aria-expanded=\{mobileOpen\}/);
  assert.match(sidebar,/nav id="clientContinuousSections"/);
  assert.match(sidebar,/nav\.mobileClosed\{display:none\}/);
  assert.match(sidebar,/@media\(max-width:600px\)/);
  assert.match(sidebar,/setMobileOpen\(false\);/);
  assert.match(sidebar,/\.navToggle:focus-visible\{outline:3px solid/);
  assert.match(sidebar,/\.navToggle\{display:none/);
  assert.match(smoke,/await page\.setViewportSize\(\{width:390,height:780\}\)/);
  assert.match(smoke,/Client mobile sidebar must offer a visible Show sections toggle/);
  assert.match(smoke,/Client mobile navigation must preserve seven fictional in-progress inspections/);
  assert.doesNotMatch(sidebar,/\/inspectorhub|\/client-dashboard|\/agency-dashboard/);
});
