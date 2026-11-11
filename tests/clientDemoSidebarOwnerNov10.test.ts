import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";
const side=readFileSync("components/ClientWorkspaceSidebar.tsx","utf8");
const ops=readFileSync("app/demo/client-operations/page.tsx","utf8");
const css=readFileSync("app/globals.css","utf8");
const inspected=readFileSync("app/demo/client-inspections/page.tsx","utf8");
test("every Client Demo shared-sidebar shell has fixed desktop column and mobile collapse",()=>{
 assert.match(css,/:has\(> aside\.clientSide\)\{display:grid!important;grid-template-columns:250px minmax\(0,1fr\)!important/);
 assert.match(css,/@media \(max-width:980px\)/);
 assert.match(inspected,/<ClientWorkspaceSidebar demo \/>/);
 assert.match(inspected,/ACTIVE_DEMO_INSPECTIONS/);
});
test("dark blue Client sidebar links are the single owner of commercial section routing",()=>{
 assert.match(side,/background:#102b50/);
 assert.match(side,/inspectsource:client-operations-tab/);
 for(const name of ["billing","contracts","profile"]){
   assert.ok(side.includes('selectDemoTab("'+name+'")'),name);
   assert.ok(side.includes('tab='+name),name);
 }
 assert.match(ops,/useSearchParams\(\)/);
 assert.match(ops,/Suspense fallback=/);
 assert.match(ops,/const tab:Tab=selectedTab==="contracts"\|\|selectedTab==="profile"\?selectedTab:"billing"/);
 assert.match(ops,/role="region" id="contracts-panel"/);
 assert.doesNotMatch(ops,/Client operations sections|id="billing-tab"|id="profile-tab"/);
 assert.match(ops,/Contract relationship types/);
});
