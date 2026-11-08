import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const src=fs.readFileSync("scripts/smoke-client-analytics.mjs","utf8");
test("P0 analytics smoke validates first source-button click without native Source Type selector",()=>{
  assert.match(src,/getByRole\("group",\{name:"Quick source type filters"\}\)/);
  assert.match(src,/getByRole\("button",\{name:"Independent",exact:true\}\)\.click/);
  assert.match(src,/assertCohort\(page,"Independent",15\)/);
  assert.match(src,/assertCohort\(page,"Agency",45\)/);
  assert.match(src,/assertCohort\(page,"All",60\)/);
  assert.match(src,/Obsolete graphical-browser-crashing Source Type native selector remains/);
  assert.match(src,/page\.keyboard\.press\("Enter"\)/);
  assert.match(src,/getByRole\("heading", \{name:"Analytics view could not load"\}\)/);
  assert.match(src,/errors\.length/);
  assert.match(src,/waitForEvent\("download"\)/);
  assert.match(src,/attempt <= 3/);
  assert.match(src,/Transient analytics recovery after/);
  assert.match(src,/MutationObserver\(record\)/);
  assert.match(src,/client-analytics-browser-failure\.png/);
});
