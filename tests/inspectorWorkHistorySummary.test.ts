import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { INSPECTOR_DEMO_WORK_HISTORY as records, EMPTY_WORK_HISTORY_FILTERS as empty, filterInspectorWorkHistory } from "../lib/inspectorWorkHistoryDemo";

test("filtered Work History summary has consistent totals, reviews and NCR counts", () => {
  assert.equal(records.length, 10);
  const bluewater = filterInspectorWorkHistory(records, { ...empty, client: "Bluewater LNG" });
  assert.equal(bluewater.length, 2);
  assert.equal(bluewater.filter(row => row.status === "Client reviewed").length, 1);
  assert.equal(bluewater.filter(row => row.ncr).length, 1);
  assert.equal(filterInspectorWorkHistory(records, { ...empty, client: "Bluewater LNG", from: "2026-12-01", to: "2026-08-01" }).length, 0);
});

test("summary is based on shown subset and tabs cannot resurrect an expanded record", () => {
  const source = fs.readFileSync("app/demo/inspector-work-history/page.tsx", "utf8");
  assert.match(source, /const reviewed = shown\.filter\(/);
  assert.match(source, /const ncrs = shown\.filter\(/);
  assert.match(source, /<strong>\{shown\.length\}<\/strong><span>Matching assignments performed/);
  assert.match(source, /<strong>\{shown\.length\}<\/strong><span>Matching reports submitted/);
  assert.match(source, /role="group" aria-label="Filtered synthetic work history summary"/);
  assert.match(source, /setView\("assignments"\); setOpen\(null\)/);
  assert.match(source, /setView\("reports"\); setOpen\(null\)/);
  assert.match(source, /const choose = .*setOpen\(null\)/);
  assert.match(source, /<h2>\{row\.project\}<\/h2>/);
});
