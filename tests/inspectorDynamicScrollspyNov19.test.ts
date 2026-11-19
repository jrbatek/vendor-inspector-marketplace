import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const page=readFileSync("app/demo/inspector/page.tsx","utf8");
const smoke=readFileSync("scripts/smoke-inspector-demo.mjs","utf8");
test("InspectorHub scrollspy refreshes eight section nodes when dashboards mount after hydration",()=>{
 const part=page.slice(page.indexOf("const resolveElements="),page.indexOf("const schedule=()=>{"));
 assert.match(part,/const resolveElements=\(\)=>NAV\.map/);
 assert.match(part,/const update=\(\)=>\{\s*const elements=resolveElements\(\);/);
 assert.match(part,/el\.getBoundingClientRect\(\)\.top<=threshold/);
 assert.doesNotMatch(part,/const elements=NAV\.map/);
});
test("Income does not replace Work History solely because the document is at bottom",()=>{
 const part=page.slice(page.indexOf("const update=()=>{"),page.indexOf("const schedule=()=>{"));
 assert.match(part,/atDocumentEnd && incomeAtReadingLine/);
 assert.match(part,/last\.getBoundingClientRect\(\)\.top<=threshold/);
 assert.doesNotMatch(part,/if\(window\.scrollY\+window\.innerHeight>=document\.documentElement\.scrollHeight-4\)current/);
 assert.match(smoke,/Income scrollspy regression did not reach the section-peeking geometry/);
 assert.match(smoke,/Inspector scrollspy prematurely highlighted Income while only peeking/);
});
