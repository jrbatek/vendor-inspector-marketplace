import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {ACTIVE_DEMO_INSPECTIONS, nextActiveInspectionAction, sortActiveInspections, exportActiveDemoInspectionsCsv} from "../lib/clientActiveInspections";

test("Client inspection cards and exports use the earliest action, even if fixture ordering changes", () => {
 const a = ACTIVE_DEMO_INSPECTIONS[0];
 const b = {...a, id:"DEMO-MULTI", actions:[
  {task:"Release dossier",owner:"Client",due:"2026-11-19"},
  {task:"Inspect welds",owner:"Inspector",due:"2026-11-12"},
  {task:"Obtain ITP",owner:"Vendor",due:"2026-11-15"},
 ]};
 const before=JSON.stringify(b.actions);
 assert.deepEqual(nextActiveInspectionAction(b),b.actions[1]);
 assert.equal(JSON.stringify(b.actions),before,"helper must not reorder synthetic data");
 const sorted=sortActiveInspections([b,{...a,id:"DEMO-EARLY",actions:[{task:"Confirm",owner:"QA",due:"2026-11-10"}]}],"due");
 assert.deepEqual(sorted.map(x=>x.id),["DEMO-EARLY","DEMO-MULTI"]);
 const csv=exportActiveDemoInspectionsCsv([b]);
 assert.ok(csv.includes('"Inspect welds","Inspector","2026-11-12"'),"CSV should share the card's earliest next action");
 assert.ok(!csv.includes('"Release dossier","Client","2026-11-19"'));
});
test("ties and action-free inspections render deterministically without undefined content",()=>{
 const a=ACTIVE_DEMO_INSPECTIONS[0];
 const tied={...a,actions:[
  {task:"Z task",owner:"QA",due:"2026-11-10"},
  {task:"A task",owner:"Vendor",due:"2026-11-10"},
 ]};
 assert.equal(nextActiveInspectionAction(tied)?.task,"A task");
 const empty={...a,actions:[]};
 assert.equal(nextActiveInspectionAction(empty),undefined);
 const csv=exportActiveDemoInspectionsCsv([empty]);
 assert.ok(csv.includes(',"0","","",""'),"no-action exports should use empty cells");
 const page=readFileSync("app/demo/client-inspections/page.tsx","utf8");
 assert.match(page,/const nextAction = nextActiveInspectionAction\(row\)/);
 assert.match(page,/No outstanding actions/);
 assert.doesNotMatch(page,/row\.actions\[0\]\?\.(task|due)/);
});
