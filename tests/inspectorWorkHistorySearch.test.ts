import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
 INSPECTOR_DEMO_WORK_HISTORY as history, EMPTY_WORK_HISTORY_FILTERS as empty,
 filterInspectorWorkHistory,
} from "../lib/inspectorWorkHistoryDemo";

test("Work History searches fictional project, vendor, location and exact sample reference without mutations", () => {
  const first = history[0];
  const original = [...history];
  for (const [key, value] of [
    ["project", first.project], ["vendor", first.vendor],
    ["location", first.location], ["reportId", first.reportId],
    ["id", first.id],
  ] as const) {
    assert.ok(filterInspectorWorkHistory(history, { ...empty, query: value }).includes(first), key);
  }
  assert.deepEqual(filterInspectorWorkHistory(history, { ...empty, query: "   " }), history);
  assert.deepEqual(filterInspectorWorkHistory(history, { ...empty, query: "never-existent-supplier-xyz" }), []);
  assert.deepEqual(history, original);
});

test("Search is case-insensitive, multi-term and composes with existing closeout filters", () => {
  const first = history[0];
  const keywords = first.project.split(/\s+/).slice(0,2).join(" ").toUpperCase();
  assert.ok(filterInspectorWorkHistory(history, { ...empty, query: keywords }).includes(first));
  assert.ok(filterInspectorWorkHistory(history, { ...empty, query: "seabrook houston" }).includes(first));
  assert.deepEqual(filterInspectorWorkHistory(history, { ...empty, query: "seabrook busan" }), []);
  assert.deepEqual(filterInspectorWorkHistory(history, { ...empty, query: "seabrook", client: "nonexistent" }), []);
  assert.deepEqual(filterInspectorWorkHistory(history, { ...empty, query: first.vendor, from: "2027-01-01" }), []);
});

test("Search control is labeled and resettable on both consolidated Work History views", () => {
  const source=fs.readFileSync("app/demo/inspector-work-history/page.tsx","utf8");
  assert.match(source, /type="search" aria-label="Search work history"/);
  assert.match(source, /value=\{filters.query\}/);
  assert.match(source, /choose\("query", event.target.value\)/);
  assert.match(source, /setFilters\(EMPTY_WORK_HISTORY_FILTERS\)/);
  assert.match(source, /filterInspectorWorkHistory\(rows, filters\)/);
});
