import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source=readFileSync("app/demo/client-inspections/page.tsx","utf8");
const smoke=readFileSync("scripts/smoke-client-inspections.mjs","utf8");

test("a fast inspection detail click snapshots the current fictional list before pushState",()=>{
 const open=source.slice(source.indexOf("const openInspection="),source.indexOf("const toggleInspection="));
 assert.ok(open.indexOf("window.history.replaceState(captureListHistory()")>=0);
 assert.ok(open.indexOf("window.history.replaceState(captureListHistory()")<open.indexOf('window.history.pushState(null,"","#inspection-"+id)'));
 assert.ok(open.includes('!/^#inspection-DEMO-ACT-[1-7]$/.test(window.location.hash)'));
});

test("all Client inspection filters save the next state immediately for Back/Forward",()=>{
 const collapse=source.slice(source.indexOf("const collapseInspectionForFilter="),source.indexOf("const dueCount"));
 assert.ok(collapse.includes('pending?:Partial<StoredInspectionList>'));
 assert.ok(collapse.includes('...snapshot[inspectionListHistoryKey],...pending'));
 for(const marker of ['collapseInspectionForFilter({filters:nextFilters})','collapseInspectionForFilter({sort:"due"})','collapseInspectionForFilter({sort:"start"})','collapseInspectionForFilter({sort:"stage"})','collapseInspectionForFilter({dueOnly:true})','collapseInspectionForFilter({ncrOnly:true})','collapseInspectionForFilter({actionOwner:e.target.value})','collapseInspectionForFilter({keyword:e.target.value})']) assert.ok(source.includes(marker),marker);
 assert.ok(smoke.includes("Changing Client inspection stage did not synchronously capture the next history state"));
 assert.doesNotMatch(collapse,/supabase|fetch\(|createClient|localStorage/);
});
