import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";
const page=readFileSync("app/demo/inspector-income/page.tsx","utf8");
const smoke=readFileSync("scripts/smoke-inspector-income.mjs","utf8");

test("Income & Tax Center distinguishes the YTD cutoff from completed fictional tax years",()=>{
 assert.ok(page.includes('year===2026?"Current-year YTD data through:":"Historical synthetic data snapshot:"'));
 assert.ok(page.includes("Viewing completed fictional {year} earnings, not {year}-to-date activity"));
 assert.ok(page.includes("Only 2026 uses the YTD cutoff."));
 assert.ok(page.includes("2026-11-01T23:59:59-06:00"));
 assert.ok(page.includes('year===2026?"Current-year YTD":"Completed fictional tax year"'));
 assert.doesNotMatch(page,/supabaseBrowser|fetch\(|\.insert\(|\.update\(/);
});
test("hosted Chromium verifies historical tax years and 2026 YTD labels alongside PDF downloads",()=>{
 for(const needle of ["Current 2026 income must disclose its precise YTD snapshot cutoff",
   "Completed synthetic tax years must not be labeled current-year YTD",
   "Completed tax-year context is missing for ",
   "Downloaded income file is not a PDF"])
   assert.ok(smoke.includes(needle),needle);
});
