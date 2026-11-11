import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
const source=fs.readFileSync("app/demo/agency/page.tsx","utf8");
const pkg=fs.readFileSync("package.json","utf8");
const browser=fs.readFileSync("scripts/smoke-agency-scrollspy.mjs","utf8");
test("Agency one-page scrollspy remains visible at end of page, with real Chromium regression wired",()=>{
 assert.match(source,/window\.scrollY\+window\.innerHeight>=document\.documentElement\.scrollHeight-4/);
 assert.match(source,/const nav = \["Overview", "Resource Pool"/);
 assert.doesNotMatch(source,/id="analytics"|id="find-inspectors-recruiting"|id="integrations"/);
 assert.match(browser,/manual up\/down/);
 assert.ok(pkg.includes("smoke:agency-scrollspy"));
 for(const path of [".github/workflows/validate.yml",".github/workflows/autonomous-qa.yml"]){
   assert.match(fs.readFileSync(path,"utf8"),/npm run smoke:agency-scrollspy/);
 }
});
