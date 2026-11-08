import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";
import {AGENCY_CAPACITY,capacityByRegion,capacityTotals} from "../lib/agencyDemoCapacity";
test("capacity regions are valid synthetic data with auditable totals",()=>{
 assert.equal(AGENCY_CAPACITY.length,4);
 assert.deepEqual(capacityTotals(AGENCY_CAPACITY),{available:39,assigned:32,tentative:16,blocked:8,total:95});
 for(const r of AGENCY_CAPACITY){
  assert.ok([r.available,r.assigned,r.tentative,r.blocked].every(v=>Number.isInteger(v)&&v>=0));
  assert.deepEqual(capacityByRegion(r.region),[r]);
 }
 assert.equal(capacityByRegion("All regions").length,4);
 assert.equal(capacityByRegion("unknown").length,0);
});
test("agency capacity selector, reset and summary are visible and accessible",()=>{
 const s=readFileSync("app/demo/agency/page.tsx","utf8");
 assert.match(s,/aria-label="Capacity region"/);
 assert.match(s,/value=\{capacityRegion\}/);
 assert.match(s,/selectedCapacity\.map\(/);
 assert.match(s,/onClick=\{\(\)=>setCapacityRegion\("All regions"\)\}/);
 assert.match(s,/aria-live="polite"/);
 assert.match(s,/Capacity is synthetic/);
});
