import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";
import {AGENCY_CAPACITY,capacityByRegion,capacityTotals,exportAgencyCapacityCsv} from "../lib/agencyDemoCapacity";
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
test("Agency one-page Demo does not reintroduce retired Availability & Capacity section",()=>{
 const s=readFileSync("app/demo/agency/page.tsx","utf8");
 assert.doesNotMatch(s,/id="availability-capacity"/);
 assert.doesNotMatch(s,/"Availability & Capacity"/);
 assert.doesNotMatch(s,/aria-label="Capacity region"/);
 assert.doesNotMatch(s,/download="inspectsource-synthetic-agency-capacity.csv"/);
 assert.match(s,/Mass Resource Connect/);
 assert.match(s,/AGENCY_SYNTHETIC_RESOURCE_TOTAL/);
});
test("exported fictional capacity CSV respects region filter, totals and synthetic-only boundaries",()=>{
 const all=exportAgencyCapacityCsv(AGENCY_CAPACITY);
 assert.ok(all.startsWith("\uFEFF"));
 assert.ok(all.includes('"SYNTHETIC - NOT VERIFIED"'));
 assert.equal(all.split("\r\n").filter(Boolean).length,5);
 for (const item of AGENCY_CAPACITY) {
  const csv=exportAgencyCapacityCsv(capacityByRegion(item.region));
  assert.equal(csv.split("\r\n").filter(Boolean).length,2);
  assert.ok(csv.includes('"'+item.region+'"'));
  assert.ok(csv.includes('"'+(item.available+item.assigned+item.tentative+item.blocked)+'"'));
  assert.ok(!csv.includes("inspectorId")&&!csv.includes("bank"));
 }
 assert.deepEqual(exportAgencyCapacityCsv([]).split("\r\n").filter(Boolean).length,1);
});
test("retired Agency capacity UI does not remove reusable synthetic capacity fixtures or exports",()=>{
 const source=readFileSync("app/demo/agency/page.tsx","utf8");
 const library=readFileSync("lib/agencyDemoCapacity.ts","utf8");
 assert.doesNotMatch(source,/capacityByRegion|capacityTotals|exportAgencyCapacityCsv/);
 assert.doesNotMatch(source,/id="availability-capacity"/);
 assert.match(library,/export (const|function) exportAgencyCapacityCsv|exportAgencyCapacityCsv/);
 assert.doesNotMatch(source,/\.insert\(|\.update\(/);
});
