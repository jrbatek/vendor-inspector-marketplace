import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {AGENCY_FEATURED_RESOURCES,AGENCY_RESOURCE_POOL,AGENCY_SYNTHETIC_RESOURCE_TOTAL,filterAgencyResources} from "../lib/agencyDemoResources";
test("Agency synthetic resource count is real, deterministic, unique and anchored to all five featured inspectors",()=>{
 assert.equal(AGENCY_SYNTHETIC_RESOURCE_TOTAL,2823);
 assert.equal(AGENCY_RESOURCE_POOL.length,2823);
 assert.equal(new Set(AGENCY_RESOURCE_POOL.map(r=>r.id)).size,2823);
 assert.deepEqual(AGENCY_RESOURCE_POOL.slice(0,5),AGENCY_FEATURED_RESOURCES);
 assert.deepEqual(AGENCY_RESOURCE_POOL.slice(0,5).map(r=>r.name),["Maya Chen","Omar Haddad","Elena Rossi","Daniel Okafor","Priya Nair"]);
});
test("Agency large pool composes keyword, region, affiliation and relationship filters without live data",()=>{
 const all={query:"",region:"All regions",affiliation:"All statuses",relationship:"All relationships"};
 assert.equal(filterAgencyResources(AGENCY_RESOURCE_POOL,all).length,2823);
 assert.deepEqual(filterAgencyResources(AGENCY_RESOURCE_POOL,{...all,query:"IS-20418"}).map(r=>r.name),["Maya Chen"]);
 assert.deepEqual(filterAgencyResources(AGENCY_RESOURCE_POOL,{...all,query:"Maya",region:"North America",affiliation:"Verified",relationship:"Employee"}).map(r=>r.id),["IS-20418"]);
 assert.equal(filterAgencyResources(AGENCY_RESOURCE_POOL,{...all,query:"nonexistent person"}).length,0);
 assert.ok(filterAgencyResources(AGENCY_RESOURCE_POOL,{...all,region:"Middle East"}).length>0);
});
test("Agency resource browser remains explicit, synthetic, accessible and downloadable tests are included in hosted QA",()=>{
 const page=readFileSync("app/demo/agency-resources/page.tsx","utf8");
 const script=readFileSync("scripts/smoke-agency-resources.mjs","utf8");
 assert.match(page,/Synthetic sample pool/);
 assert.match(page,/aria-live="polite"/);
 assert.match(page,/Search all fictional agency resources/);
 assert.match(page,/View fictional resource/);
 assert.match(page,/href="\/demo\/agency#resource-pool"/);
 assert.doesNotMatch(page,/supabaseBrowser|fetch\(|createClient|process\.env/);
 assert.match(script,/chromium.launch/);
 for(const wf of [".github/workflows/validate.yml",".github/workflows/autonomous-qa.yml"]){
  assert.match(readFileSync(wf,"utf8"),/npm run smoke:agency-resources/);
 }
});
