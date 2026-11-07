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

test("independent and agency channel controls wrap safely rather than disappear off-screen",()=>{
 assert.match(page,/\.channels\{display:grid;grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
 assert.match(page,/\.channels div,.independent\{display:grid;gap:5px;min-width:0/);
 assert.match(page,/\.channels button,.independent button\{width:fit-content;max-width:100%;min-width:0;white-space:normal;overflow-wrap:anywhere/);
 assert.match(page,/@media\(max-width:560px\)\{\.person\{display:grid\}/);
 assert.match(page,/Samira Costa/);
 assert.match(page,/Use independent channel/);
});

test("source toggles stay fully visible at intermediate widths and explicitly announce selection",()=>{
 assert.match(page,/@media\(max-width:1180px\)\{\.sectionHead\{display:block\}/);
 assert.match(page,/\.seg\{display:flex;flex-wrap:wrap;gap:6px;min-width:0;max-width:100%\}/);
 assert.match(page,/\.seg button\{max-width:100%;white-space:normal;overflow-wrap:anywhere;text-align:left\}/);
 assert.match(page,/\.seg button\[aria-pressed=true\]\{background:#0f172a;color:#fff;border-color:#0f172a;font-weight:900;box-shadow:/);
 assert.match(page,/className="sourceSummary" role="status">Current source:/);
 assert.match(page,/source==="independent"\?"Independent inspectors only"/);
});
