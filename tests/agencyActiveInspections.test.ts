import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
const src=fs.readFileSync("app/demo/agency/ActiveInspectionsClient.tsx","utf8");
const parent=fs.readFileSync("app/demo/agency/page.tsx","utf8");
const smoke=fs.readFileSync("scripts/smoke-agency-capacity.mjs","utf8");
test("Agency Demo Open Inspection includes distinct fictional assignment and action histories",()=>{
 for(const id of ["AG-INV-201","AG-INV-202","AG-INV-203"])assert.ok(src.includes(id));
 for(const field of ["client:","vendor:","site:","contact:","po:","scope:","equipment:","report:","ncr:","milestone:","completed:","outstanding:"])assert.ok(src.includes(field));
 assert.match(src,/aria-expanded=\{openAgencyInspection===item.id\}/);
 assert.match(src,/className="agencyInspectionDetail" aria-label=/);
 assert.match(parent,/No actual client reports/);
 assert.match(parent,/ssr: false/);
 assert.match(parent,/if \(!agencyPageReady\) return <main/);
 assert.match(parent,/Preparing fictional Agency Workspace examples/);
 assert.match(parent,/<AgencyActiveInspections \/>/);
 assert.match(parent,/Preparing three fictional inspection examples/);
 assert.match(parent,/\.agencyInspectionTools select:focus-visible/);
 assert.match(parent,/\.agencyInspectionSummary button/);
 assert.doesNotMatch(src,/supabaseBrowser|\.insert\(|\.update\(|\.delete\(/);
});
test("Agency built-browser tests open all examples and filter to one fictional stage",()=>{
 assert.match(smoke,/agencyExampleNames=\["Gulf Coast LNG","Qatar compression package","Italian valve package"\]/);
 assert.match(smoke,/getByRole\("button",\{name:"Open Inspection"\}\)\.click\(\)/);
 assert.match(smoke,/agencyStage\.selectOption\("NCR follow-up"\)/);
 assert.match(smoke,/getByRole\("button",\{name:"Reset inspection stage"\}\)\.click\(\)/);
});
