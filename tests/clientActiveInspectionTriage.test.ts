import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  ACTIVE_DEMO_INSPECTIONS as inspections, EMPTY_INSPECTION_FILTERS,
  filterActiveInspections, sortActiveInspections, filterActiveInspectionsByActionDue, DEMO_ACTION_REFERENCE_DATE,
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

test("fixed synthetic due-action focus narrows to 2 inspections without mutating any fixtures", () => {
  const original = [...inspections];
  assert.equal(DEMO_ACTION_REFERENCE_DATE,"2026-11-08");
  const focused = filterActiveInspectionsByActionDue(inspections,true);
  assert.deepEqual(focused.map(row => row.project),["Atlantic LNG Terminal","Pacific Hydrogen Hub"]);
  assert.equal(filterActiveInspectionsByActionDue(inspections,false).length,7);
  const inProject = filterActiveInspections(inspections,{...EMPTY_INSPECTION_FILTERS,project:"Pacific Hydrogen Hub"});
  assert.deepEqual(filterActiveInspectionsByActionDue(inProject,true), inProject);
  assert.deepEqual(inspections,original);
});

test("client demo due filter exposes legible mutually exclusive buttons, date provenance and reset", () => {
  const source = fs.readFileSync("app/demo/client-inspections/page.tsx","utf8");
  assert.match(source,/aria-label="Outstanding-action urgency"/);
  assert.match(source,/aria-pressed=\{dueOnly\}/);
  assert.match(source,/aria-pressed=\{!dueOnly\}/);
  assert.match(source,/Due or overdue \(\{dueCount\}\)/);
  assert.match(source,/setDueOnly\(false\)/);
  assert.match(source,/synthetic as of November 8, 2026/);
  assert.match(source,/\.dueFilter button:focus-visible/);
});
