import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const source=readFileSync("app/demo/agency-opportunities/page.tsx","utf8");
const smoke=readFileSync("scripts/smoke-agency-opportunities.mjs","utf8");
test("Agency opportunity preview and confirmation state is isolated across user actions",()=>{
 assert.match(source,/const closePreview=\(\)=>\{setOpened\(null\);setInterest\(""\);\}/);
 assert.match(source,/const togglePreview=\(id:string\)=>\{setOpened\(current=>current===id\?null:id\);setInterest\(""\);\}/);
 for(const setter of ["setQuery","setRegion","setStatus","setDiscipline"])assert.ok(source.includes(setter+"(e.target.value);closePreview();"),setter);
 assert.match(source,/aria-controls=\{opened===op\.id\?"opportunity-details-"\+op\.id:undefined\}/);
 assert.match(smoke,/confirmation leaked after closing and reopening preview/);
 assert.match(smoke,/Changing Agency filters left stale details or confirmation/);
 assert.doesNotMatch(source,/supabaseBrowser|createClient\(|fetch\(|process\.env/);
});
test("Agency opportunity browser targets stay visible and meet mobile accessibility sizing",()=>{
 assert.match(source,/select,input\{min-height:44px;box-sizing:border-box/);
 assert.match(source,/button\{min-height:44px/);
 assert.match(source,/header :global\(a\)\{display:inline-flex;align-items:center;min-height:44px/);
 assert.match(source,/button\[aria-expanded="true"\]\{background:#4c1d95/);
 assert.match(source,/button:disabled\{background:#e2e8f0;border-color:#94a3b8;color:#334155;opacity:1/);
 assert.match(smoke,/main\.wrap input, main\.wrap select, main\.wrap button, main\.wrap header a/);
 assert.match(smoke,/x\.height>=43\.5/);
 for(const wf of [".github/workflows/validate.yml",".github/workflows/autonomous-qa.yml"])
  assert.match(readFileSync(wf,"utf8"),/npm run smoke:agency-opportunities/);
});
