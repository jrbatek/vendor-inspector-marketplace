import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";
const agency=readFileSync("app/demo/agency/page.tsx","utf8");
test("Agency remains one operational page with eight retained sections",()=>{
 const ids=["overview","resource-pool","mass-resource-connect","availability-capacity","opportunities","active-inspections","reports-ncrs","contracts-commercials"];
 for(const id of ids)assert.ok(agency.includes('id="'+id+'"'),id);
 for(const id of ["analytics","integrations","find-inspectors-recruiting"])assert.doesNotMatch(agency,new RegExp('id="'+id+'"'));
 assert.match(agency,/const nav = \["Overview", "Resource Pool", "Mass Resource Connect", "Availability & Capacity", "Opportunities", "Active Inspections", "Reports & NCRs", "Contracts & Commercials"\]/);
 assert.doesNotMatch(agency,/Agency Analytics|Resource-system connectivity|Find Inspectors \/ Recruiting|marketplaceOpen/);
});
test("Agency scrollspy tracks viewport, manual reverse scroll, hashes and link interactions",()=>{
 assert.match(agency,/getBoundingClientRect\(\)\.top<=threshold/);
 assert.match(agency,/window\.addEventListener\("scroll",updateActive,\{passive:true\}\)/);
 assert.match(agency,/window\.removeEventListener\("scroll",updateActive\)/);
 assert.match(agency,/window\.addEventListener\("hashchange",onHash\)/);
 assert.match(agency,/document\.getElementById\(hash\)\?\.scrollIntoView\(\{behavior:window\.matchMedia/);
 assert.doesNotMatch(agency,/event\.preventDefault\(\)/);
 assert.match(agency,/aria-current=\{activeSection === anchor \? "page" : undefined\}/);
 assert.match(agency,/\[id\]\{scroll-margin-top:24px\}/);
});
