import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const smoke=readFileSync("scripts/smoke-client-inspections.mjs","utf8");
const page=readFileSync("app/demo/client-inspections/page.tsx","utf8");

test("hosted Chromium verifies malformed legacy Client history resets seven fictional inspections via real Back/Forward",()=>{
  assert.match(smoke,/const legacySnapshotPage=await browser\.newPage\(\)/);
  assert.match(smoke,/__inspectSourceClientInspectionList:\{filters:\{stage:"UNKNOWN LIVE STAGE"\},sort:"production"\}/);
  assert.match(smoke,/await legacySnapshotPage\.goBack\(\)/);
  assert.match(smoke,/await legacySnapshotPage\.goForward\(\)/);
  assert.match(smoke,/Malformed-history browser probe did not start with seven fictional inspections/);
  assert.match(smoke,/Malformed Client inspection browser history unexpectedly required live authentication/);
  assert.match(page,/parseDemoInspectionListState\(window\.history\.state\?\.\[inspectionListHistoryKey\]\)/);
});
