import assert from "node:assert/strict";
import test from "node:test";
import {
  EMPTY_WORK_HISTORY_FILTERS, INSPECTOR_DEMO_WORK_HISTORY,
  exportInspectorWorkHistoryCsv, filterInspectorWorkHistory,
} from "../lib/inspectorWorkHistoryDemo";

test("work-history CSV exports only the currently filtered fictional assignments", () => {
  const filtered = filterInspectorWorkHistory(INSPECTOR_DEMO_WORK_HISTORY, {
    ...EMPTY_WORK_HISTORY_FILTERS, client: "Bluewater LNG", ncr: "with",
  });
  assert.equal(filtered.length, 1);
  const csv = exportInspectorWorkHistoryCsv(filtered, "assignments");
  assert.match(csv, /^\uFEFF"Demo Only","Record Type"/);
  assert.equal(csv.trim().split("\r\n").length, 2);
  assert.match(csv, /"SYNTHETIC - NOT VERIFIED"/);
  assert.match(csv, /"WH-260914"/);
  assert.match(csv, /"IR-260914"/);
  assert.doesNotMatch(csv, /"WH-260821"/);
});

test("reports CSV uses report IDs and preserves readable closeout information", () => {
  const csv = exportInspectorWorkHistoryCsv(INSPECTOR_DEMO_WORK_HISTORY.slice(0, 2), "reports");
  assert.match(csv, /"Report submitted","IR-260918"/);
  assert.match(csv, /"Report submitted","IR-260914"/);
  assert.match(csv, /"No","Materials and weld traceability verified/);
  assert.match(csv, /"Yes","FAT accepted/);
});

test("CSV escapes quotes, commas and blocks spreadsheet formula payloads", () => {
  const row = {
    ...INSPECTOR_DEMO_WORK_HISTORY[0],
    client: '=HYPERLINK("https://example.invalid","click")',
    project: 'Fictional, "quoted" project',
    finding: "-1+2",
  };
  const csv = exportInspectorWorkHistoryCsv([row], "assignments");
  assert.match(csv, /"'=HYPERLINK\(""https:\/\/example\.invalid"",""click""\)"/);
  assert.match(csv, /"Fictional, ""quoted"" project"/);
  assert.match(csv, /"'-1\+2"/);
  assert.equal(csv.trim().split("\r\n").length, 2);
});
