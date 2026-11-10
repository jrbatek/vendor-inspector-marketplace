import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const page=readFileSync("app/demo/client-inspections/page.tsx","utf8");
const browser=readFileSync("scripts/smoke-client-inspections.mjs","utf8");

test("Client Demo names and removes each distinct inspection filter without losing other conditions",()=>{
 for (const key of ["stage","project","inspector","from","to"]){
   assert.ok(page.includes('if (filters.'+key+') activeFilterChips.push'),key);
 }
 for (const key of ["actionOwner","keyword.trim()","dueOnly","ncrOnly"]){
   assert.ok(page.includes('if ('+key+') activeFilterChips.push'),key);
 }
 assert.match(page,/Active inspection filters/);
 assert.match(page,/aria-label=\{`Remove \$\{chip.label\} filter`\}/);
 assert.match(page,/onClick=\{chip.clear\}/);
 assert.match(page,/activeFilterChips.length > 0/);
 assert.match(page,/clear: \(\) => update\("stage", ""\)/);
 assert.match(page,/clear: \(\) => update\("project", ""\)/);
 assert.match(page,/All records are fictional/);
 assert.doesNotMatch(page,/supabaseBrowser|createClient|process\.env/);
});

test("Removable chips have high contrast and are validated in real Chromium",()=>{
 assert.match(page,/\.filterChips\{display:flex;align-items:center;flex-wrap:wrap;/);
 assert.doesNotMatch(page,/\}\.\.filterChips\{/,"A malformed doubled-dot CSS selector makes the chip container style invalid");
 assert.match(page,/\.inspectionWorkspace \.filterChips button\{[^}]*background:#fff;color:#1e3a8a/);
 assert.match(page,/\.inspectionWorkspace \.filterChips button:hover\{background:#1e40af;color:#fff/);
 assert.match(page,/\.inspectionWorkspace \.filterChips button:focus-visible\{outline:3px solid #2563eb/);
 for(const marker of ["Expected three active criteria chips","Removing stage chip cleared another filter","Removing last chip must restore all seven fictional inspections"]){
   assert.ok(browser.includes(marker),marker);
 }
});
