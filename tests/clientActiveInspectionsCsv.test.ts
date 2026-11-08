import test from "node:test";
import assert from "node:assert/strict";
import {
  ACTIVE_DEMO_INSPECTIONS, EMPTY_INSPECTION_FILTERS,
  exportActiveDemoInspectionsCsv, filterActiveInspections,
} from "../lib/clientActiveInspections";

test("exports only the filtered synthetic in-progress inspection", () => {
  const rows = filterActiveInspections(ACTIVE_DEMO_INSPECTIONS, {...EMPTY_INSPECTION_FILTERS, stage: "NCR follow-up"});
  assert.equal(rows.length, 1);
  const csv = exportActiveDemoInspectionsCsv(rows);
  assert.match(csv, /^\uFEFF"Demo Only","Inspection ID"/);
  assert.match(csv, /"SYNTHETIC - NOT VERIFIED"/);
  assert.match(csv, /"DEMO-ACT-5"/);
  assert.match(csv, /"NCR follow-up"/);
  assert.doesNotMatch(csv, /"DEMO-ACT-1"/);
  assert.equal(csv.trim().split("\r\n").length, 2);
});

test("exports all seven fictional client inspection stages unfiltered", () => {
  const csv = exportActiveDemoInspectionsCsv(ACTIVE_DEMO_INSPECTIONS);
  assert.equal(csv.trim().split("\r\n").length, 8);
  for (const row of ACTIVE_DEMO_INSPECTIONS) assert.ok(csv.includes('"' + row.id + '"'));
});

test("quotes commas and escapes spreadsheet-formula cells", () => {
  const row = {...ACTIVE_DEMO_INSPECTIONS[0], vendor: "=HYPERLINK(bad)", scope: 'Check, "weld" trace'};
  const csv = exportActiveDemoInspectionsCsv([row]);
  assert.match(csv, /"'=HYPERLINK\(bad\)"/);
  assert.match(csv, /"Check, ""weld"" trace"/);
  assert.equal(csv.trim().split("\r\n").length, 2);
});
