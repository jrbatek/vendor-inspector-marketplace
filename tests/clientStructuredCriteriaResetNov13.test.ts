import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const page=fs.readFileSync("app/demo/client/page.tsx","utf8");
const smoke=fs.readFileSync("scripts/smoke-client-inspections.mjs","utf8");

test("all five Client Structured Selection fields invalidate outdated previews",()=>{
 assert.ok(page.includes("const updateCriterion=(key:keyof typeof criteria,value:string)=>{"));
 assert.ok(page.includes('setCriteriaPreview("");'));
 for(const key of ["region","qualification","start","experience","source"])
   assert.ok(page.includes('onChange={e=>updateCriterion("'+key+'",e.target.value)}'),"Missing edit invalidation for "+key);
});

test("Client Chromium smoke verifies stale preview removal and updated summary",()=>{
 for(const phrase of [
  "Structured preview remained visible after changing geography",
  "Structured preview did not reflect updated geography",
  "Structured preview remained visible after changing qualification",
  "Structured preview did not reflect updated certification"
 ]) assert.ok(smoke.includes(phrase),phrase);
});
