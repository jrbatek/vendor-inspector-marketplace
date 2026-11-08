import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

test("fictional income PDF download is smoke-tested in real browser for all available years",()=>{
 const smoke=fs.readFileSync("scripts/smoke-inspector-income.mjs","utf8");
 const pkg=JSON.parse(fs.readFileSync("package.json","utf8"));
 const validate=fs.readFileSync(".github/workflows/validate.yml","utf8");
 const qa=fs.readFileSync(".github/workflows/autonomous-qa.yml","utf8");
 assert.equal(pkg.scripts["smoke:inspector-income"],"node scripts/smoke-inspector-income.mjs");
 assert.match(smoke,/\["2026",4\],\["2025",3\],\["2024",2\]/);
 assert.match(smoke,/page\.waitForEvent\("download"/);
 assert.match(smoke,/PDFDocument\.load\(bytes\)/);
 assert.match(smoke,/UNVERIFIED SAMPLE/);
 assert.match(smoke,/pageerror/);
 assert.match(smoke,/Unauthenticated demo opened live workspace/);
 assert.match(validate,/run: npm run smoke:inspector-income/);
 assert.match(qa,/run: npm run smoke:inspector-income/);
});
