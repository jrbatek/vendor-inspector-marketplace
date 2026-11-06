import test from "node:test";
import assert from "node:assert/strict";
import { ACTIVE_DEMO_INSPECTIONS, EMPTY_INSPECTION_FILTERS, filterActiveInspections } from "../lib/clientActiveInspections";

test("date range includes ongoing inspections that start before and end after the range",()=>{
  const filtered=filterActiveInspections(ACTIVE_DEMO_INSPECTIONS,{
    ...EMPTY_INSPECTION_FILTERS,from:"2026-11-01",to:"2026-11-03"
  });
  assert.deepEqual(filtered.map(row=>row.id),[
    "DEMO-ACT-2","DEMO-ACT-3","DEMO-ACT-5","DEMO-ACT-6","DEMO-ACT-7"
  ]);
  assert.ok(filtered.some(row=>row.start<"2026-11-01"&&row.end>"2026-11-03"));
});
test("inclusive overlap recognizes boundary days, before/after windows and reversed dates",()=>{
  const pick=(from:string,to:string)=>filterActiveInspections(ACTIVE_DEMO_INSPECTIONS,{
    ...EMPTY_INSPECTION_FILTERS,from,to
  }).map(row=>row.id);
  assert.deepEqual(pick("2026-11-20","2026-11-20"),["DEMO-ACT-2"]);
  assert.deepEqual(pick("2026-11-21","2026-11-25"),[]);
  assert.deepEqual(pick("2026-10-28","2026-10-28"),["DEMO-ACT-7"]);
  assert.deepEqual(pick("2026-11-03","2026-11-01"),[]);
});
