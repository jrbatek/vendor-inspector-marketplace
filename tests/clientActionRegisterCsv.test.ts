import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {ACTIVE_DEMO_INSPECTIONS,activeInspectionActionRegister,exportActiveDemoActionRegisterCsv} from "../lib/clientActiveInspections";

test("synthetic action CSV includes seven filtered-action records and no production data",()=>{
 const actions=activeInspectionActionRegister(ACTIVE_DEMO_INSPECTIONS);
 const csv=exportActiveDemoActionRegisterCsv(actions);
 assert.ok(csv.startsWith("\uFEFF"));
 assert.equal(csv.trim().split("\r\n").length,8);
 assert.match(csv,/SYNTHETIC - NOT VERIFIED/);
 assert.match(csv,/Pacific Hydrogen Hub/);
 assert.match(csv,/Vendor quality manager/);
 assert.ok(!csv.includes("Live client"));
 const one=exportActiveDemoActionRegisterCsv(actions.slice(0,1));
 assert.equal(one.trim().split("\r\n").length,2);
 assert.ok(!one.includes("Bayou Vessel Works"));
});
test("formula-injection protection remains active in arbitrary synthetic action values",()=>{
 const actions=activeInspectionActionRegister(ACTIVE_DEMO_INSPECTIONS);
 const hostile=actions.map((action,i)=>i===0 ? {...action,task:'=HYPERLINK("evil")',owner:" +1"} : action);
 const csv=exportActiveDemoActionRegisterCsv(hostile);
 assert.ok(csv.includes('"\'=HYPERLINK(""evil"")"'));
 assert.ok(csv.includes('"\' +1"'));
});
test("action CSV is browser-local, accessible and reflects filtered table",()=>{
 const page=readFileSync("app/demo/client-inspections/page.tsx","utf8");
 const smoke=readFileSync("scripts/smoke-client-inspections.mjs","utf8");
 assert.match(page,/exportActiveDemoActionRegisterCsv\(actionRegister\)/);
 assert.match(page,/download="inspectsource-synthetic-action-register.csv"/);
 assert.match(page,/actionRegister\.length > 0 && <a className="actionExport"/);
 assert.match(page,/\.actionExport:focus-visible/);
 assert.match(smoke,/Action CSV expected a header and seven rows/);
 assert.doesNotMatch(page,/supabase|createClient|fetch\(/);
});
