import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { parseDemoInspectionListState } from "../lib/demoClientInspectionListState";
import { ACTIVE_DEMO_INSPECTIONS, EMPTY_INSPECTION_FILTERS } from "../lib/clientActiveInspections";

test("history without a fictional list snapshot resets to a clean seven-inspection list", () => {
  for (const snapshot of [undefined, null, false, [], "old-format", {}, { filters: null }]) {
    const restored = parseDemoInspectionListState(snapshot);
    assert.deepEqual(restored.filters, EMPTY_INSPECTION_FILTERS);
    assert.equal(restored.sort, "due");
    assert.equal(restored.dueOnly, false);
    assert.equal(restored.ncrOnly, false);
    assert.equal(restored.actionOwner, "");
    assert.equal(restored.keyword, "");
  }
});

test("history keeps real synthetic filters and safely completes older partial entries", () => {
  const first = ACTIVE_DEMO_INSPECTIONS[0];
  const full = {
    filters: { stage: first.stage, project: first.project, inspector: first.inspector,
      from: "2026-11-01", to: "2026-11-30" },
    sort: "stage", dueOnly: true, ncrOnly: false,
    actionOwner: first.actions[0].owner, keyword: "Bayou Vessel",
  };
  assert.deepEqual(parseDemoInspectionListState(full), full);
  const partial = parseDemoInspectionListState({ filters: { stage: first.stage }, sort: "start" });
  assert.deepEqual(partial.filters, { ...EMPTY_INSPECTION_FILTERS, stage: first.stage });
  assert.equal(partial.sort, "start");
});

test("history cannot restore unknown live-looking values or invalid dates", () => {
  const bad = parseDemoInspectionListState({
    filters: { stage: "AUTHENTICATED", project: "private", inspector: "live-user",
      from: "2026-02-30", to: "2026-13-01" },
    sort: "database", dueOnly: "true", ncrOnly: 1,
    actionOwner: "private-account", keyword: 123,
  });
  assert.deepEqual(bad.filters, EMPTY_INSPECTION_FILTERS);
  assert.equal(bad.sort, "due");
  assert.equal(bad.dueOnly, false);
  assert.equal(bad.ncrOnly, false);
  assert.equal(bad.actionOwner, "");
  assert.equal(bad.keyword, "");
  assert.equal(parseDemoInspectionListState({keyword:"x".repeat(2000)}).keyword.length,512);
});

test("Client Demo Back/Forward always normalizes missing history snapshots without login", () => {
  const source=readFileSync("app/demo/client-inspections/page.tsx","utf8");
  assert.match(source, /parseDemoInspectionListState\(window\.history\.state\?\.\[inspectionListHistoryKey\]\)/);
  assert.match(source, /setFilters\(saved\.filters\)/);
  assert.match(source, /window\.addEventListener\("popstate",syncFromHash\)/);
  assert.doesNotMatch(source, /href="\/client-dashboard"/);
});
