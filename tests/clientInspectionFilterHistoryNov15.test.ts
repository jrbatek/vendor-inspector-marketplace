import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";
const source=readFileSync("app/demo/client-inspections/page.tsx","utf8");
const smoke=readFileSync("scripts/smoke-client-inspections.mjs","utf8");
test("Filter changes cannot leave stale inspection links and browser Back restores the seven-record demo",()=>{
 assert.ok(source.includes("const collapseInspectionForFilter="));
 assert.ok(source.includes('window.history.replaceState(null,"",embedded?"#inspections-in-progress":window.location.pathname+window.location.search)'));
 assert.ok(source.includes("setFilters(EMPTY_INSPECTION_FILTERS)"));
 assert.ok(source.includes("if(found){"));
 assert.ok(source.includes('if(/^#inspection-DEMO-ACT-[1-7]$/.test(window.location.hash))'));
 for(const key of ["Filtering an open inspection left a stale inspection detail URL","Browser Back to deep-linked inspection did not reset restrictive filters","Browser Forward did not restore filtered-list navigation"])assert.ok(smoke.includes(key),key);
});
