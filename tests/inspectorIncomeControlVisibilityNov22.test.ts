import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const page=readFileSync("app/demo/inspector-income/page.tsx","utf8");
const smoke=readFileSync("scripts/smoke-inspector-income.mjs","utf8");

test("fictional Income and Tax actions, downloads, year selector and disabled states stay legible",()=>{
  assert.match(page,/button,.card a\{display:inline-flex;align-items:center;justify-content:center;min-height:44px;box-sizing:border-box/);
  assert.match(page,/select\{min-height:44px;width:100%;max-width:100%;box-sizing:border-box/);
  assert.match(page,/select:disabled\{background:#f1f5f9;color:#475569;border-color:#94a3b8;opacity:1/);
  assert.match(page,/button:disabled,button:disabled:hover\{background:#e2e8f0;color:#334155;border-color:#94a3b8;opacity:1/);
  assert.match(page,/a:focus-visible,button:focus-visible,select:focus-visible\{outline:3px/);
  assert.match(page,/.hero a\{display:inline-flex;align-items:center;min-height:44px/);
});
test("Income real browser smoke checks links and simulated preference dialog",()=>{
  assert.match(smoke,/initialTargets/);
  assert.match(smoke,/dialogControls/);
  assert.match(smoke,/getByRole\("dialog",\{name:"Payment preference demo"\}\)/);
  assert.match(smoke,/Demo must not collect bank account data/);
  assert.match(page,/No bank account, routing, card number or payment credentials are requested or stored/);
});
