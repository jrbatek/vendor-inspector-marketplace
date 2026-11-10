import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { EMPTY_WORK_HISTORY_FILTERS, INSPECTOR_DEMO_WORK_HISTORY, filterInspectorWorkHistory } from "../lib/inspectorWorkHistoryDemo";

test("invalid Inspector Work History dates are distinct from genuine empty filters", () => {
  const invalid = { ...EMPTY_WORK_HISTORY_FILTERS, client: "Bluewater LNG", from: "2026-10-20", to: "2026-08-01" };
  assert.equal(filterInspectorWorkHistory(INSPECTOR_DEMO_WORK_HISTORY, invalid).length, 0);
  const recovered = { ...invalid, from: "", to: "" };
  assert.equal(filterInspectorWorkHistory(INSPECTOR_DEMO_WORK_HISTORY, recovered).length, 2);
  assert.equal(recovered.client, invalid.client, "Date correction must preserve other selected filters");
  assert.equal(filterInspectorWorkHistory(INSPECTOR_DEMO_WORK_HISTORY, {
    ...recovered, query: "no-matching-fictitious-record",
  }).length, 0, "Genuine empty results must remain distinct from invalid dates");
});

test("Work History date recovery is usable, visible and non-destructive across both views", () => {
  const source = fs.readFileSync("app/demo/inspector-work-history/page.tsx", "utf8");
  const browser = fs.readFileSync("scripts/smoke-inspector-demo.mjs", "utf8");
  assert.match(source, /const clearInvalidDates = \(\) => \{ setFilters\(current => \(\{ \.\.\.current, from: "", to: "" \}\)\); setOpen\(null\); \};/);
  assert.match(source, /invalidDateNotice" role="alert"/);
  assert.match(source, /invalidDates \? "Invalid completion date range" : "No matching work history"/);
  assert.match(source, /invalidDates \? "Invalid completion date range — correct or clear the dates/);
  assert.match(source, /onClick=\{clearInvalidDates\}>Clear invalid date range/);
  assert.match(source, /\.invalidDateNotice button:focus-visible|button:focus-visible/);
  assert.match(browser, /getByRole\("button", \{ name: "Clear invalid date range" \}\)\.click\(\)/);
  assert.match(browser, /Recovery must preserve independently selected client/);
});
