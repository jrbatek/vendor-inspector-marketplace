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
test("Agency global navigation excludes the section removed from the one-page Agency Demo",()=>{
 assert.match(nav,/\["Resource Pool", "\/demo\/agency#resource-pool"\]/);
 assert.doesNotMatch(nav,/\/demo\/agency#find-inspectors-recruiting/);
});

test("live account links remain available independently from synthetic demo navigation",()=>{
 assert.match(nav,/\["Client Dashboard", "\/client-dashboard"\]/);
 assert.match(nav,/\["InspectorHub", "\/inspectorhub"\]/);
});


test("client demo keeps completed inspection history inside Analytics rather than a separate hub card",()=>{
 const hub=fs.readFileSync("app/demo/client/page.tsx","utf8");
 const analytics=fs.readFileSync("app/demo/client-analytics/page.tsx","utf8");
 const sidebar=fs.readFileSync("components/ClientWorkspaceSidebar.tsx","utf8");
 assert.doesNotMatch(hub,/title:"Inspection history"/);
 assert.match(hub,/title:"Analytics"/);
 assert.match(analytics,/className="historyLink" href="\/demo\/client-history"/);
 assert.match(analytics,/Browse completed inspection history/);
 assert.match(analytics,/\.actions \.historyLink:focus-visible/);
 assert.match(sidebar,/Analytics<\/Link>/);
 assert.doesNotMatch(sidebar,/>Inspection History<\/Link>/);
});
