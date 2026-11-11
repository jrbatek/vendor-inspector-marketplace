import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const page=readFileSync("app/demo/client-operations/page.tsx","utf8");
const smoke=readFileSync("scripts/smoke-demo-control-visibility.mjs","utf8");

test("Contract relationship tabs retain accessible keyboard behavior",()=>{
  assert.doesNotMatch(page, /Client operations sections|chooseTab/);
  assert.match(page, /handleTabKeyboard\(event, Object\.keys\(contracts\)/);
  assert.match(page, /event\.key==="ArrowRight"/);
  assert.match(page, /event\.key==="ArrowLeft"/);
  assert.match(page, /event\.key==="Home"/);
  assert.match(page, /event\.key==="End"/);
  assert.match(page, /event\.preventDefault\(\)/);
  assert.match(page, /querySelectorAll<HTMLButtonElement>/);
  assert.match(page, /\.contractTabs button:focus-visible/);
  assert.match(page, /aria-selected=\{contractTab===t\}/);
});

test("real-browser smoke checks Client sidebar sections and contract tab navigation at both widths",()=>{
  assert.match(smoke, /route === "\/demo\/client-operations"/);
  assert.match(smoke, /Contracts sidebar link did not become active/);
  assert.match(smoke, /Contract tabs End did not activate Others/);
  assert.match(smoke, /Contract tabs Home did not restore InspectSource/);
  assert.match(smoke, /Browser back failed to restore Billing section and sidebar highlight/);
});
