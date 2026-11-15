import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source=readFileSync("app/demo/client-inspections/page.tsx","utf8");
const browser=readFileSync("scripts/smoke-client-inspections.mjs","utf8");

test("seven fictional inspection details support public deep links and browser history",()=>{
  assert.match(source,/hashchange",syncFromHash/);
  assert.match(source,/popstate",syncFromHash/);
  assert.match(source,/DEMO-ACT-\[1-7\]/);
  assert.match(source,/ACTIVE_DEMO_INSPECTIONS\.some\(row=>row\.id===id\)/);
  assert.match(source,/const openInspection=\(id:string\)=>/);
  assert.match(source,/window\.history\.pushState\(null,"","#inspection-"\+id\)/);
  assert.match(source,/toggleInspection\(row\.id, open\)/);
  assert.match(source,/event\.preventDefault\(\);openInspection\(action\.inspectionId\)/);
  const direct=source.slice(source.indexOf("const syncFromHash"),source.indexOf("const toggleInspection"));
  assert.ok(direct.length>100);
  assert.doesNotMatch(direct,/supabase|fetch\(|insert\(|createClient/);
});
test("Hosted Chromium verifies shared detail URL, browser history and action register without login",()=>{
  for(const marker of ["Direct inspection deep link opened the wrong synthetic inspection",
    "Browser Back from inspection detail lost synthetic list",
    "Outstanding action link did not establish shareable inspection URL",
    "Deep-linked synthetic inspection unexpectedly requires authentication"])
    assert.ok(browser.includes(marker),marker);
});
