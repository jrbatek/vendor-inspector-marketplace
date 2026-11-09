import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const page=readFileSync("app/demo/client-operations/page.tsx","utf8");
const smoke=readFileSync("scripts/smoke-demo-control-visibility.mjs","utf8");

test("Client Operations top-level and contract tablists use accessible keyboard behavior",()=>{
  assert.match(page, /handleTabKeyboard\(event, \["billing","contracts","profile"\], tab, chooseTab\)/);
  assert.match(page, /handleTabKeyboard\(event, Object\.keys\(contracts\)/);
  assert.match(page, /event\.key==="ArrowRight"/);
  assert.match(page, /event\.key==="ArrowLeft"/);
  assert.match(page, /event\.key==="Home"/);
  assert.match(page, /event\.key==="End"/);
  assert.match(page, /event\.preventDefault\(\)/);
  assert.match(page, /querySelectorAll<HTMLButtonElement>/);
  assert.match(page, /\.tabs button:focus-visible,\.contractTabs button:focus-visible/);
  assert.match(page, /aria-selected=\{tab==="contracts"\}/);
});

test("real-browser control smoke checks Client Operations tab navigation at both widths",()=>{
  assert.match(smoke, /route === "\/demo\/client-operations"/);
  assert.match(smoke, /Client operations ArrowRight did not activate Contracts/);
  assert.match(smoke, /Contract tabs End did not activate Others/);
  assert.match(smoke, /Contract tabs Home did not restore InspectSource/);
  assert.match(smoke, /Client operations ArrowLeft did not wrap to Profile/);
});
