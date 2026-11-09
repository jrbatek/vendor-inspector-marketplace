import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {ACTIVE_DEMO_INSPECTIONS,activeInspectionActionRegister,filterActiveInspections,EMPTY_INSPECTION_FILTERS} from "../lib/clientActiveInspections";

test("action register orders and labels all seven fictional assignments without mutating source records",()=>{
 const original=JSON.stringify(ACTIVE_DEMO_INSPECTIONS);
 const actions=activeInspectionActionRegister(ACTIVE_DEMO_INSPECTIONS);
 assert.equal(actions.length,7);
 assert.deepEqual(actions.map(row=>row.due),[...actions.map(row=>row.due)].sort());
 assert.equal(actions[0].project,"Pacific Hydrogen Hub");
 assert.equal(actions[0].urgency,"Overdue");
 assert.equal(actions[1].urgency,"Due today");
 assert.equal(actions.filter(row=>row.urgency==="Upcoming").length,5);
 assert.equal(new Set(actions.map(row=>row.inspectionId)).size,7);
 assert.equal(JSON.stringify(ACTIVE_DEMO_INSPECTIONS),original);
});
test("action register respects inspection filter subsets and empty states",()=>{
 const first=ACTIVE_DEMO_INSPECTIONS[0];
 const selected=filterActiveInspections(ACTIVE_DEMO_INSPECTIONS,{...EMPTY_INSPECTION_FILTERS,project:first.project});
 assert.deepEqual(activeInspectionActionRegister(selected).map(row=>row.inspectionId),[first.id]);
 assert.deepEqual(activeInspectionActionRegister([]),[]);
 assert.equal(activeInspectionActionRegister(selected,"2026-11-20")[0].urgency,"Overdue");
});
test("fictional action register is accessible, links to matching detail and has legible control states",()=>{
 const page=readFileSync("app/demo/client-inspections/page.tsx","utf8");
 const smoke=readFileSync("scripts/smoke-client-inspections.mjs","utf8");
 assert.match(page,/aria-labelledby="action-register-title"/);
 assert.match(page,/activeInspectionActionRegister\(rows\)/);
 assert.match(page,/href=\{\x60#inspection-\$\{action.inspectionId\}\x60\}/);
 assert.match(page,/id=\{\x60inspection-\$\{row.id\}\x60\}/);
 assert.match(page,/setExpanded\(action.inspectionId\)/);
 assert.match(page,/actionRegister td a:focus-visible/);
 assert.match(page,/\.urgencyOverdue\{background:#fee2e2;color:#991b1b\}/);
 assert.match(smoke,/Action register must show all seven fictional outstanding actions/);
 assert.doesNotMatch(page,/supabase|createClient|fetch\(/);
});
