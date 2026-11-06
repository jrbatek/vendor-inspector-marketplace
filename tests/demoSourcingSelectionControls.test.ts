import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
const page=fs.readFileSync("app/demo/client-agency-sourcing/page.tsx","utf8");

test("sourcing selectors have legible unselected, selected, hover and keyboard-focus states",()=>{
 assert.match(page,/\.seg button,.channels button,.independent button\{[^}]*background:#fff;color:#0f172a/);
 assert.match(page,/\.seg button\[aria-pressed=true\]\{background:#0f172a;color:#fff/);
 assert.match(page,/\.seg button:hover\{background:#f1f5f9;color:#0f172a/);
 assert.match(page,/\.seg button:focus-visible/);
 assert.match(page,/\.channels button\.chosen,.independent button\.chosen\{background:#0f172a;color:#fff/);
});
test("agency and independent selection buttons provide browser-only demo confirmation",()=>{
 assert.match(page,/selectedChannel,setSelectedChannel/);
 assert.match(page,/role="status"/);
 assert.match(page,/setSelectedChannel\(\{inspectorId:p.id,channel:c.agency\}\)/);
 assert.match(page,/setSelectedChannel\(\{inspectorId:p.id,channel:"Independent"\}\)/);
 assert.match(page,/Clear selection/);
 assert.match(page,/no assignment, commercial routing or production match was created/);
 assert.doesNotMatch(page,/supabaseBrowser|fetch\(|\.insert\(|\.update\(/);
});
