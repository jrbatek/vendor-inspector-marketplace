import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const page = fs.readFileSync("app/demo/agency-affiliations/page.tsx","utf8");

test("synthetic agency affiliation status filters cover every visible lifecycle state",()=>{
 assert.match(page,/FILTER_OPTIONS: AffiliationFilter\[\] = \["All", "Pending", "Verified", "Expiring", "Disputed", "Ended"\]/);
 assert.match(page,/filter === "Pending" && state === "Inspector Confirmation Pending"/);
 assert.match(page,/filter === "Ended" && state === "Expired \/ Ended"/);
 assert.match(page,/state === filter/);
 assert.match(page,/affiliations\.filter\(row => matchesAffiliationFilter\(row\.state,filter\)\)/);
 assert.match(page,/<tbody>\{visible\.map\(a=>/);
 assert.match(page,/Showing \{visible\.length\} of \{affiliations\.length\} synthetic affiliation examples/);
});

test("affiliation filters and claim guidance expose keyboard and screen reader states",()=>{
 assert.match(page,/role="group" aria-label="Affiliation status filters"/);
 assert.match(page,/aria-pressed=\{filter===option\}/);
 assert.match(page,/onClick=\{\(\)=>setFilter\(option\)\}/);
 assert.match(page,/aria-expanded=\{claimPreview\}/);
 assert.match(page,/aria-controls="agency-claim-explainer"/);
 assert.match(page,/hidden=\{!claimPreview\}/);
 assert.match(page,/\.filters button:focus-visible/);
 assert.match(page,/role="status"/);
 assert.doesNotMatch(page,/<button>Pending<\/button>|<button>Verified<\/button>/);
});

test("affiliation demo remains fictional and never accesses live matching or private records",()=>{
 assert.match(page,/synthetic affiliation records only/);
 assert.match(page,/No live inspector is contacted or changed/);
 assert.doesNotMatch(page,/supabaseBrowser|createClient|process\.env|fetch\(|XMLHttpRequest|FormData/);
});
