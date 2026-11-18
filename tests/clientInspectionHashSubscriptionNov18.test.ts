import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const page=fs.readFileSync("app/demo/client-inspections/page.tsx","utf8");
const smoke=fs.readFileSync("scripts/smoke-client-inspections.mjs","utf8");

test("register URL listeners before first Client inspection hash synchronization",()=>{
 const effect=page.slice(page.indexOf("const syncFromHash=()=>"),page.indexOf("},[]);",page.indexOf("const syncFromHash=()=>")));
 const hash=effect.indexOf('window.addEventListener("hashchange",syncFromHash)');
 const pop=effect.indexOf('window.addEventListener("popstate",syncFromHash)');
 const initial=effect.indexOf("    syncFromHash();");
 const ready=effect.indexOf("    setHistoryReady(true);");
 assert.ok(hash>=0&&pop>=0&&initial>=0&&ready>=0);
 assert.ok(hash<initial&&pop<initial&&initial<ready,
   "A hash or popstate between initial sync and subscription must not be missed");
 assert.ok(effect.includes('window.removeEventListener("hashchange",syncFromHash)'));
 assert.ok(effect.includes('window.removeEventListener("popstate",syncFromHash)'));
});

test("real Chromium captures live hash/list state before waiting for the deep link",()=>{
 assert.match(smoke,/checkpoint\("navigated to deep link #4"\)/);
 assert.match(smoke,/for \(let attempt=1;attempt<=3;attempt\+\+\)/);
 assert.match(smoke,/Rapid deep-link hydration probe lost the seven synthetic inspections/);
 assert.ok(smoke.indexOf('checkpoint("navigated to deep link #4")')<
           smoke.indexOf('sharedDetails.waitFor({timeout:12000})'));
 assert.match(smoke,/Deep-linked synthetic inspection unexpectedly requires authentication/);
});

test("capture a fictional inspection hash before Next hydration overwrites the URL",()=>{
 const layout=fs.readFileSync("app/demo/client-inspections/layout.tsx","utf8");
 assert.match(layout,/inspectsource-early-inspection-hash/);
 assert.match(layout,/event\\.newURL/);
 assert.match(layout,/inspection-DEMO-ACT-\\[1-7\\]/);
 assert.match(page,/__inspectSourceEarlyInspectionHash/);
 assert.match(page,/Date\\.now\\(\\)-early\\.at < 30000/);
 assert.match(page,/addEventListener\\("inspectsource:early-inspection-hash",syncFromHash\\)/);
 assert.match(page,/removeEventListener\\("inspectsource:early-inspection-hash",syncFromHash\\)/);
});
