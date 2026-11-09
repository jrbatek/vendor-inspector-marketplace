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
test("agency capacity selector, reset and summary are visible and accessible",()=>{
 const s=readFileSync("app/demo/agency/page.tsx","utf8");
 assert.match(s,/aria-label="Capacity region"/);
 assert.match(s,/value=\{capacityRegion\}/);
 assert.match(s,/selectedCapacity\.map\(/);
 assert.match(s,/onClick=\{\(\)=>setCapacityRegion\("All regions"\)\}/);
 assert.match(s,/aria-live="polite"/);
 assert.match(s,/Capacity is synthetic/);
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
test("Agency Demo capacity export is a readable, accessible browser-only downloadable CSV",()=>{
 const source=readFileSync("app/demo/agency/page.tsx","utf8");
 const browser=readFileSync("scripts/smoke-agency-capacity.mjs","utf8");
 assert.match(source,/download="inspectsource-synthetic-agency-capacity.csv"/);
 assert.match(source,/encodeURIComponent\(exportAgencyCapacityCsv\(selectedCapacity\)\)/);
 assert.match(source,/capacityExport:focus-visible/);
 assert.match(browser,/page.waitForEvent\("download"\)/);
 assert.match(browser,/SYNTHETIC - NOT VERIFIED/);
 assert.doesNotMatch(source,/\.insert\(|\.update\(/);
});
