import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const source=fs.readFileSync("app/demo/client-analytics/page.tsx","utf8");

test("Visible Source Type segmented controls replace the unreliable native source selector",()=>{
  assert.match(source,/aria-label="Quick source type filters"/);
  assert.match(source,/<strong>Source Type<\/strong>/);
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

test("Source Type segmented controls share state with the synthetic source chart",()=>{
  assert.match(source,/sourceType===ALL\|\|row.sourceType===sourceType/);
  assert.doesNotMatch(source,/<Filter label="Source Type"/);
  assert.match(source,/onSelect=\{setSourceType\}/);
  assert.doesNotMatch(source,/supabaseBrowser/);
});
