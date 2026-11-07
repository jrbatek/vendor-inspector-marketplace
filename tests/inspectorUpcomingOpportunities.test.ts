import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const demo=fs.readFileSync("app/demo/inspector/page.tsx","utf8");
test("Inspector Demo matched opportunities use upcoming November–December 2026 synthetic windows",()=>{
 for(const label of ["Dec 2 - Dec 14, 2026","Dec 7 - Dec 18, 2026","Nov 23 - Dec 11, 2026"]) assert.ok(demo.includes(label),label);
 assert.doesNotMatch(demo,/dates:"(?:Sep 21 - Oct 12|Oct 5 - Oct 16|Oct 20 - Nov 14), 2026"/);
 assert.match(demo,/id:"OP-1048"/);
 assert.match(demo,/id:"OP-1051"/);
 assert.match(demo,/id:"OP-1057"/);
 assert.match(demo,/Matched inspection work/);
});
test("opportunity previews remain fictional and never touch live assignment decisions",()=>{
 assert.match(demo,/const OPPS:Opportunity\[\]=\[/);
 assert.match(demo,/no production record was changed/);
 assert.match(demo,/No live assignment decisions will be made/);
 assert.doesNotMatch(demo,/supabaseBrowser|\.insert\(|\.update\(|\.delete\(/);
});
