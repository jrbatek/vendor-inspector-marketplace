import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const page = fs.readFileSync("app/demo/inspector/page.tsx","utf8");

test("synthetic opportunity modal supports keyboard close and returns focus to its opening button",()=>{
 assert.match(page,/useRef<HTMLButtonElement \| null>/);
 assert.match(page,/opportunityClose\.current\?\.focus\(\)/);
 assert.match(page,/opportunityTrigger\.current\?\.focus\(\)/);
 assert.match(page,/opportunityTrigger\.current=e\.currentTarget/);
 assert.match(page,/e\.key==="Escape"/);
 assert.match(page,/e\.key==="Tab"/);
 assert.match(page,/e\.shiftKey/);
 assert.doesNotMatch(page,/Array\.from\(/);
 assert.match(page,/aria-describedby="opportunity-demo-note"/);
 assert.match(page,/ref=\{opportunityClose\}/);
 assert.match(page,/onClick=\{closeOpportunity\}/);
});

test("opportunity actions remain simulated and section-scoped",()=>{
 for(const action of ["Opportunity accepted","More information requested","Opportunity declined"]){
   assert.ok(page.includes(action), action);
 }
 assert.match(page,/demoAction\("Opportunity declined"\);closeOpportunity\(\)/);
 assert.match(page,/setNoticeSection\("opportunities"\)/);
 assert.match(page,/No live assignment decisions will be made/);
 assert.doesNotMatch(page,/supabaseBrowser|\.insert\(|\.update\(|\.delete\(/);
});
