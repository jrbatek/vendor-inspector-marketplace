import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source=readFileSync("app/demo/inspector-work-history/page.tsx","utf8");
const smoke=readFileSync("scripts/smoke-work-history-summary.mjs","utf8");
test("Work History has eight correctly labelled independently clearable active filter chips",()=>{
  const pairs=[["query","Search"],["client","Client"],["industry","Industry"],["commodity","Commodity"],["status","Closeout status"],["ncr","NCR findings"],["from","Completed from"],["to","Completed through"]];
  for(const [key,label] of pairs)assert.ok(source.includes('key:"'+key+'",label:"'+label+'"'),label);
  assert.match(source,/aria-label="Active Work History filters"/);
  assert.match(source,/onClick=\{\(\) => clearFilter\(item\.key\)\}/);
  assert.match(source,/const clearFilter = \(key: keyof WorkHistoryFilters\) => \{/);
  assert.match(source,/choose\(key, ""\);/);
  assert.ok(source.includes('[data-history-filter="${key}"]'));
  assert.equal((source.match(/role="status"/g) || []).length, 1);
  assert.match(source,/Showing \{shown\.length\} of \{rows\.length\} fictional assignments/);
  assert.match(source,/\.activeHistoryFilters button\{background:#fff;color:#115e59/);
  assert.match(source,/\.activeHistoryFilters button:focus-visible\{outline:3px solid #0d9488/);
});
test("Hosted Chromium verifies individual clearing preserves other data and the CSV/PDF views",()=>{
  for(const marker of ["Clear Client filter: Bluewater LNG","Clearing one client filter must restore unfiltered counters","Active filter chips must disappear once all selections are cleared","Synthetic report PDF invalid"]){
    assert.ok(smoke.includes(marker),marker);
  }
});
