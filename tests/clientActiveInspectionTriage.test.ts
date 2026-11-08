import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  ACTIVE_DEMO_INSPECTIONS as inspections, EMPTY_INSPECTION_FILTERS,
  filterActiveInspections, sortActiveInspections,
} from "../lib/clientActiveInspections";

test("fictional active inspections have varied, meaningful next-action deadlines", () => {
  assert.equal(inspections.length, 7);
  assert.ok(new Set(inspections.flatMap(row => row.actions.map(action => action.due))).size >= 5);
  for (const row of inspections) {
    assert.ok(row.actions.length);
    assert.ok(row.actions.every(action => /^2026-11-\d{2}$/.test(action.due)));
    assert.ok(row.start <= row.end, row.id);
  }
});

test("priority sorting is chronological and does not mutate fixtures or filtered results", () => {
  const original = [...inspections];
  const due = sortActiveInspections(inspections, "due");
  assert.deepEqual(due.map(row => row.actions[0].due), [...due.map(row => row.actions[0].due)].sort());
  assert.notEqual(due[0].id, inspections[0].id);
  const byStart = sortActiveInspections(inspections, "start");
  assert.deepEqual(byStart.map(row => row.start), [...byStart.map(row => row.start)].sort());
  assert.deepEqual(sortActiveInspections(inspections, "stage"), original);
  assert.deepEqual(inspections, original);
  const only = filterActiveInspections(inspections, { ...EMPTY_INSPECTION_FILTERS, project: inspections[1].project });
  assert.deepEqual(sortActiveInspections(only, "due"), only);
  assert.deepEqual(sortActiveInspections([], "due"), []);
});

test("Client Demo shows accessible action triage controls and visible next-action deadlines", () => {
  const source = fs.readFileSync("app/demo/client-inspections/page.tsx", "utf8");
  assert.match(source, /role="group" aria-label="Sort synthetic inspections"/);
  assert.match(source, /aria-pressed=\{sort === "due"\}/);
  assert.match(source, /Next action: \{row.actions\[0\]\?\.task\} · Due/);
  assert.match(source, /setSort\("due"\)/);
  assert.match(source, /sortBar button:focus-visible/);
});
