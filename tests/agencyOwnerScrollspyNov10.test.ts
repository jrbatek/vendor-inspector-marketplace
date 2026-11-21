import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";
const agency=readFileSync("app/demo/agency/page.tsx","utf8");
test("Agency remains one operational page with seven retained sections",()=>{
 const ids=["overview","resource-pool","mass-resource-connect","opportunities","active-inspections","reports-ncrs","contracts-commercials"];
 for(const id of ids)assert.ok(agency.includes('id="'+id+'"'),id);
 for(const id of ["analytics","integrations","find-inspectors-recruiting","availability-capacity"])assert.doesNotMatch(agency,new RegExp('id="'+id+'"'));
 assert.match(agency,/const nav = \["Overview", "Resource Pool", "Mass Resource Connect", "Opportunities", "Active Inspections", "Reports & NCRs", "Contracts & Commercials"\]/);
 assert.doesNotMatch(agency,/Agency Analytics|Resource-system connectivity|Find Inspectors \/ Recruiting|marketplaceOpen/);
});
test("Agency scrollspy tracks viewport, manual reverse scroll, hashes and link interactions",()=>{
 assert.match(agency,/getBoundingClientRect\(\)\.top<=threshold/);
 assert.match(agency,/window\.addEventListener\("scroll",updateActive,\{passive:true\}\)/);
 assert.match(agency,/window\.removeEventListener\("scroll",updateActive\)/);
 assert.match(agency,/window\.addEventListener\("hashchange",onHash\)/);
 assert.match(agency,/document\.getElementById\(hash\)\?\.scrollIntoView\(\{behavior:window\.matchMedia/);
 assert.match(agency,/event\.preventDefault\(\)/);
 assert.match(agency,/window\.history\.pushState\(null,"","#"\+id\)/);
 assert.match(agency,/target\.scrollIntoView\(\{/);
 assert.match(agency,/window\.matchMedia\("\(prefers-reduced-motion: reduce\)"\)/);
 assert.match(agency,/window\.addEventListener\("popstate",onHash\)/);
 assert.match(agency,/window\.removeEventListener\("popstate",onHash\)/);
 assert.match(agency,/aria-current=\{activeSection === anchor \? "page" : undefined\}/);
 assert.match(agency,/\[id\]\{scroll-margin-top:24px\}/);
});


test("Agency demo navigation and operational controls keep visible 44px click targets",()=>{
 assert.match(agency,/\.side a\{display:flex;align-items:center;min-height:44px;padding:8px/);
 assert.match(agency,/\.apiWalkthrough select\{min-height:44px/);
 assert.match(agency,/\.reportTools select,\.reportTools button\{min-height:44px/);
 assert.match(agency,/\.reportTools a\.reportDownload\{[^}]*min-height:44px/);
 const smoke=readFileSync("scripts/smoke-agency-scrollspy.mjs","utf8");
 assert.match(smoke,/verifyAgencyNavTargets\("Desktop"\)/);
 assert.match(smoke,/verifyAgencyNavTargets\("Mobile"\)/);
 assert.match(agency,/\.side a:focus-visible\{outline:3px solid #c4b5fd/);
 assert.match(agency,/\.side a\[aria-current=page\]\{background:#6d28d9;color:#fff/);
});
