import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {AGENCY_FEATURED_RESOURCES,AGENCY_RESOURCE_POOL,AGENCY_SYNTHETIC_RESOURCE_TOTAL} from "../lib/agencyDemoResources";

test("Agency featured roster shares the same fictional resource objects as the complete directory",()=>{
  assert.equal(AGENCY_SYNTHETIC_RESOURCE_TOTAL,2823);
  assert.equal(AGENCY_FEATURED_RESOURCES.length,5);
  assert.deepEqual(AGENCY_RESOURCE_POOL.slice(0,5),AGENCY_FEATURED_RESOURCES);
  const page=readFileSync("app/demo/agency/page.tsx","utf8");
  assert.match(page,/const resources = AGENCY_FEATURED_RESOURCES\.map\(/);
  assert.match(page,/resource\.id, resource\.name, resource\.relationship, resource\.affiliation/);
  for(const field of ["coverage","capacity","dayRate","terms","commercialPackage"]){
    assert.ok(page.includes("resource."+field),"Missing shared resource field: "+field);
  }
  assert.doesNotMatch(page,/const resources\s*=\s*\[\s*\[/);
  assert.match(page,/Showing \{visibleResources\.length\} of \{AGENCY_SYNTHETIC_RESOURCE_TOTAL\.toLocaleString/);
});
