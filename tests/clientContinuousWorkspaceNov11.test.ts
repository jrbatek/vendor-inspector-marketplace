import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
const client=fs.readFileSync("app/demo/client/page.tsx","utf8");
const sidebar=fs.readFileSync("components/ClientContinuousSidebar.tsx","utf8");
const inspect=fs.readFileSync("app/demo/client-inspections/page.tsx","utf8");
const analytics=fs.readFileSync("app/demo/client-analytics/page.tsx","utf8");
const ops=fs.readFileSync("app/demo/client-operations/page.tsx","utf8");
test("Client Demo stays one page with full embedded, synthetic sections and three stacked intake mechanisms",()=>{
 const ids=["request-inspectors","natural-language","email-requirements","structured-selection","inspections-in-progress","analytics"];
 for(const id of ids)assert.ok(client.includes('id="'+id+'"'),id);
 for(const tag of ["ClientInspectionsDemo","ClientAnalyticsDemo","ClientOperationsDemo"])assert.ok(client.includes(`<${tag}/>`),tag);
 assert.equal((client.match(/ClientDemoEmbeddedContext.Provider value=\{true\}/g)||[]).length,3);
 assert.ok(client.indexOf('id="natural-language"')<client.indexOf('id="email-requirements"'));
 assert.ok(client.indexOf('id="email-requirements"')<client.indexOf('id="structured-selection"'));
 assert.doesNotMatch(client, /className="portfolioGrid"/);
});
test("Client sections embed without nested live/authenticated workspace shells",()=>{
 for(const src of [inspect,analytics,ops]){
  assert.match(src,/useContext\(ClientDemoEmbeddedContext\)/);
  assert.doesNotMatch(src,/export default function \w+\(\{embedded/);
 }
 assert.match(inspect,/!embedded&&<ClientWorkspaceSidebar demo/);
 assert.match(analytics,/!embedded&&<ClientWorkspaceSidebar demo/);
 assert.match(ops,/!embedded&&<ClientWorkspaceSidebar demo/);
 for(const id of ["billing-payment","contracts","profile"])assert.ok(ops.includes('embedded?"'+id+'"'),id);
 assert.match(ops,/embedded\|\|tab==="contracts"/);
 assert.match(ops,/embedded\|\|tab==="profile"/);
 assert.doesNotMatch(client,/supabaseBrowser|createClient|\.insert\(/i);
});
test("Sticky dark-blue sidebar keeps nine accessible scrollspy links for demos only",()=>{
 for(const id of ["request-inspectors","natural-language","email-requirements","structured-selection","inspections-in-progress","analytics","billing-payment","contracts","profile"])assert.ok(sidebar.includes('"'+id+'"'),id);
 assert.match(sidebar,/position:sticky/);
 assert.match(sidebar,/aria-current=\{active===id\?"location":undefined\}/);
 assert.match(sidebar,/window\.addEventListener\("scroll",schedule/);
 assert.match(sidebar,/window\.addEventListener\("hashchange",onHash/);
 assert.match(sidebar,/window\.addEventListener\("popstate",onHash/);
 assert.match(sidebar,/@media\(max-width:980px\)/);
});
