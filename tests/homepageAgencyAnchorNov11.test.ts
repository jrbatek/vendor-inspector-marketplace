import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const homepage=readFileSync("app/page.tsx","utf8");
const agency=readFileSync("app/demo/agency/page.tsx","utf8");
const smoke=readFileSync("scripts/smoke-agency-scrollspy.mjs","utf8");

test("Homepage Agency demo CTA targets retained Resource Pool and never removed recruiting",()=>{
 assert.match(homepage,/href="\/demo\/agency#resource-pool">Explore Agency Resource Pool/);
 assert.doesNotMatch(homepage,/href="\/demo\/agency#find-inspectors-recruiting"/);
 assert.match(agency,/id="resource-pool"/);
 assert.doesNotMatch(agency,/id="find-inspectors-recruiting"/);
 assert.match(homepage,/Inspection reports and NCR follow-up/);
});

test("Hosted Chromium verifies homepage-to-Agency Resource Pool hash and scrollspy",()=>{
 assert.match(smoke,/Homepage still points to removed Agency recruiting section/);
 assert.match(smoke,/Homepage Resource Pool deep link did not stay inside Agency Demo/);
 assert.match(smoke,/await active\(page,"resource-pool"\)/);
});
