import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const page=fs.readFileSync("app/demo/client/page.tsx","utf8");
test("synthetic Client Demo requirement and structured shortlist use a current future window",()=>{
 assert.match(page,/starting November 16 for approximately three weeks/);
 assert.match(page, /start:"2026-11-16"/);
 assert.match(page, /<label>Inspection start<input type="date"/);
 assert.match(page, /Houston refinery, Nov 16, 2026/);
 assert.doesNotMatch(page,/starting September 14|Sep 14, 2026/);
 assert.match(page,/Client Demo · Synthetic data/);
 assert.match(page,/Demo uploads stay in this browser and are not sent to production/);
});
