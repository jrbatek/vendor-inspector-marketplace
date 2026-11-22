import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const routes=[
 "app/demo/client/page.tsx",
 "app/demo/client-analytics/page.tsx",
 "app/demo/client-agency-sourcing/page.tsx",
 "app/demo/client-data/page.tsx",
 "app/demo/client-inspections/page.tsx",
 "app/demo/client-operations/page.tsx",
];
const smoke=readFileSync("scripts/smoke-client-inspections.mjs","utf8");

test("all directly rendered Client Demo pages use the dark-blue sidebar; legacy History redirects",()=>{
 for(const path of routes){
  const source=readFileSync(path,"utf8");
  if(path==="app/demo/client/page.tsx"){
   assert.match(source,/<ClientContinuousSidebar\/>/,path);
   assert.match(source,/ClientDemoEmbeddedContext\.Provider/,path);
  }else{
   assert.match(source,/<ClientWorkspaceSidebar demo\s*\/>/,path);
  }
 }
});

test("hosted Chromium checks shared sidebar geometry and redirects obsolete Client History bookmarks",()=>{
 for(const route of ["/demo/client","/demo/client-analytics","/demo/client-agency-sourcing","/demo/client-data"]){
  assert.ok(smoke.includes('["'+route+'",'),route);
 }
 assert.match(smoke, /\["\/demo\/client-history","analytics"\]/);
 assert.match(smoke, /\["\/demo\/client-history\?view=active","inspections-in-progress"\]/);
 assert.match(smoke,/verifyClientSidebarLayout\(label\+" desktop",true\)/);
 assert.match(smoke,/verifyClientSidebarLayout\(label\+" mobile",false\)/);
 assert.match(smoke,/aside\.clientSide a\[href\^="\/client-dashboard"\]/);
 assert.match(smoke,/Multi-page sidebar audit lost the seven no-login in-progress demo inspections/);
});
