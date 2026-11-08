import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const source=fs.readFileSync("app/demo/client-analytics/page.tsx","utf8");

test("Quick source controls provide visible, accessible alternatives to native slicer",()=>{
  assert.match(source,/aria-label="Quick source type filters"/);
  assert.match(source,/Quick source filters/);
  for(const name of ['All sources','Agency','Independent']){
    assert.ok(source.includes('label:"'+name+'"'));
  }
  assert.match(source,/aria-pressed=\{sourceType===option.value\}/);
  assert.match(source,/disabled=\{!hydrated\}/);
  assert.match(source,/onClick=\{\(\)=>setSourceType\(option.value\)\}/);
  assert.match(source,/quickSources button:focus-visible/);
  assert.match(source,/quickSources button\[aria-pressed=true\]/);
  assert.match(source,/synthetic inspections match current filters/);
});

test("Quick source controls use the same synthetic filtering as source chart and selector",()=>{
  assert.match(source,/sourceType===ALL\|\|row.sourceType===sourceType/);
  assert.match(source,/label="Source Type" value=\{sourceType\}/);
  assert.match(source,/onSelect=\{setSourceType\}/);
  assert.doesNotMatch(source,/supabaseBrowser/);
});
