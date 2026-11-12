import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {AGENCY_DEMO_OPPORTUNITIES,filterAgencyDemoOpportunities} from "../lib/agencyDemoOpportunities";
test("24 distinct wholly fictional agency opportunities have consistent specific offered rates",()=>{
 assert.equal(AGENCY_DEMO_OPPORTUNITIES.length,24);
 assert.equal(new Set(AGENCY_DEMO_OPPORTUNITIES.map(x=>x.id)).size,24);
 for(const x of AGENCY_DEMO_OPPORTUNITIES){
  assert.match(x.id,/^SYN-OPP-/);
  assert.match(x.dayRate,/^(USD|EUR|AUD) [0-9,]+\/day$/);
  assert.ok(x.client&&x.vendor&&x.site&&x.qualification&&x.scope);
 }
});
test("agency opportunity search composes geography, expertise and status with no production data",()=>{
 const all={query:"",region:"All regions",status:"All statuses",discipline:"All disciplines"};
 assert.equal(filterAgencyDemoOpportunities(AGENCY_DEMO_OPPORTUNITIES,all).length,24);
 const gulf=filterAgencyDemoOpportunities(AGENCY_DEMO_OPPORTUNITIES,{...all,query:"Gulf Coast LNG"});
 assert.equal(gulf.length,4);assert.ok(gulf.every(x=>x.region==="North America"));
 assert.equal(filterAgencyDemoOpportunities(AGENCY_DEMO_OPPORTUNITIES,{...all,query:"imaginary impossible"}).length,0);
 assert.ok(filterAgencyDemoOpportunities(AGENCY_DEMO_OPPORTUNITIES,{...all,region:"Europe"}).length>0);
});
test("public agency opportunity browser exposes accessible filters and real synthetic-only detail actions",()=>{
 const source=readFileSync("app/demo/agency-opportunities/page.tsx","utf8");
 for(const label of ["Opportunity region","Opportunity status","Opportunity discipline","Search synthetic opportunities","Preview Opportunity","Preview agency interest (demo only)"])assert.ok(source.includes(label),label);
 assert.match(source,/aria-expanded=\{opened===op\.id\}/);
 assert.match(source,/Nothing was submitted or sent/);
 assert.match(source,/\/demo\/agency#opportunities/);
 assert.doesNotMatch(source,/supabaseBrowser|createClient\(|fetch\(|process\.env/);
 assert.match(readFileSync("scripts/smoke-demo-control-visibility.mjs","utf8"),/"\/demo\/agency-opportunities"/);
});

test("Agency one-page featured opportunities have actionable previews and complete search link",()=>{
 const main=readFileSync("app/demo/agency/page.tsx","utf8");
 const featured=readFileSync("components/AgencyFeaturedOpportunities.tsx","utf8");
 assert.match(main,/id="opportunities" className="card"><AgencyFeaturedOpportunities\/>/);
 assert.match(featured,/AGENCY_DEMO_OPPORTUNITIES\.slice\(0,4\)/);
 assert.match(featured,/aria-expanded=\{open===op\.id\}/);
 assert.match(featured,/href="\/demo\/agency-opportunities"|href="\/demo\/agency-opportunities"/);
 assert.match(featured,/View\/Search all opportunities/);
 assert.doesNotMatch(featured,/fetch\(|supabase|\.insert\(/);
});
