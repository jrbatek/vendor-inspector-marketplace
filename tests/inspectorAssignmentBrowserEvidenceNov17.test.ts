import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";

const smoke=readFileSync("scripts/smoke-inspector-demo.mjs","utf8");
test("hosted InspectorHub browser smoke verifies fictional action owners, dates, NCR versus punch and zero-findings state",()=>{
  for(const phrase of [
    'Synthetic assignment outstanding action register',
    'Expected two owned, due-dated fictional next actions',
    'Action owner','Due date','Reference',
    'status snapshot as of November 17, 2026',
    'Gulf NCR or LNG documentation punch item disappeared',
    'Future Orion FAT must not fabricate',
    'Open synthetic report PDF',
  ]) assert.ok(smoke.includes(phrase), "Missing browser evidence check: "+phrase);
  assert.match(smoke,/for \(const name of \["LNG Compressor Package", "Gulf Horizon Refinery Upgrade", "Orion Deepwater Platform"\]\)/);
});
