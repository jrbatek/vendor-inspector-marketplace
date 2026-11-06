import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const nav=fs.readFileSync("components/Nav.tsx","utf8");
const routes=fs.readFileSync("lib/demoExperience.ts","utf8");

test("global audience navigation stays Clients then Inspectors then Agencies",()=>{
 const clients=nav.indexOf('label: "Clients"');
 const inspectors=nav.indexOf('label: "Inspectors"');
 const agencies=nav.indexOf('label: "Agencies"');
 assert.ok(clients>=0 && clients<inspectors && inspectors<agencies);
});
test("client completed history is consolidated under Analytics, not a second menu destination",()=>{
 assert.match(nav,/\["Client Analytics Demo", "\/demo\/client-analytics"\]/);
 assert.doesNotMatch(nav,/\["Client Inspection History Demo"/);
});
test("Inspector Demo reports are reached from Work History and legacy demo links are redirected",()=>{
 assert.match(nav,/\["Work History Demo", "\/demo\/inspector-work-history"\]/);
 assert.doesNotMatch(nav,/\["Inspection Reports", "\/inspection-reports"\]/);
 assert.match(routes,/"\/inspection-reports": "\/demo\/inspector-work-history"/);
 assert.doesNotMatch(routes,/"\/inspection-reports": "\/demo\/inspector-reports"/);
});
test("live account links remain available independently from synthetic demo navigation",()=>{
 assert.match(nav,/\["Client Dashboard", "\/client-dashboard"\]/);
 assert.match(nav,/\["InspectorHub", "\/inspectorhub"\]/);
});
