import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const page=fs.readFileSync("app/demo/client-inspections/page.tsx","utf8");

test("filtered Client Demo inspection count announces singular and plural labels accurately",()=>{
 assert.match(page,/rows\.length === 1 \? "inspection" : "inspections"/);
 assert.doesNotMatch(page,/aria-label=\{`\$\{rows\.length\} items`\}/);
 assert.match(page,/rows\.length\} of \{ACTIVE_DEMO_INSPECTIONS\.length\}/);
});
