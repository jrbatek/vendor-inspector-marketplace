import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const src = fs.readFileSync("app/demo/client-analytics/page.tsx","utf8");
const smoke = fs.readFileSync("scripts/smoke-client-analytics.mjs","utf8");

test("active Client Analytics slicers are removable individually, without resetting other selections",()=>{
  const keys=["Source Type","Agency","Project","Project Type","Country","Commodity","Timing","Non-conformance","NCR Type"];
  for(const key of keys) assert.ok(src.includes(`key:"${key}"`), `Missing chip key: ${key}`);
  assert.match(src,/\.filter\(item=>item.value!==ALL\)/);
  assert.match(src,/aria-label="Active analytics filters"/);
  assert.match(src,/onClick=\{item.clear\}/);
  assert.ok(src.includes('aria-label={`Clear ${item.key} filter: ${item.value}`}'));
  assert.match(src,/activeFilterBar button:focus-visible/);
  assert.match(src,/activeFilterBar button:hover/);
  assert.doesNotMatch(src,/supabaseBrowser/);
});
test("built-app Chromium/Firefox source transition smoke validates chip recovery",()=>{
  assert.match(smoke,/getByRole\("region", \{name:"Active analytics filters"\}\)/);
  assert.match(smoke,/getByRole\("button", \{name:"Clear Source Type filter: Agency"\}\)\.click\(\)/);
  assert.match(smoke,/assertCohort\(page,"All",60\)/);
});
