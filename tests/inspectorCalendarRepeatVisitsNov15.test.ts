import assert from "node:assert/strict";
import test from "node:test";
import { adjacentDemoAssignmentDate } from "../lib/demoAssignmentNavigation";

const visits = [
  { date: "2026-12-04", state: "Assigned", project: "Gulf Horizon" },
  { date: "2026-11-13", state: "Assigned", project: "LNG Compressor" },
  { date: "2026-11-09", state: "Assigned", project: "Gulf Horizon" },
  { date: "2026-12-03", state: "Assigned", project: "Gulf Horizon" },
  { date: "2026-11-27", state: "Assigned", project: "Orion" },
  { date: "2026-11-10", state: "Assigned", project: "Gulf Horizon" },
  { date: "2026-11-12", state: "Assigned", project: "LNG Compressor" },
  { date: "2026-11-26", state: "Assigned", project: "Orion" },
  { date: "2026-11-09", state: "Assigned", project: "Gulf Horizon" }, // duplicate fixture
  { date: "2026-11-20", state: "Busy", project: "Gulf Horizon" },
];

test("a later return visit to the SAME fictional project is navigable", () => {
  assert.equal(adjacentDemoAssignmentDate(visits, "2026-11-27", "next"), "2026-12-03");
  assert.equal(adjacentDemoAssignmentDate(visits, "2026-12-03", "previous"), "2026-11-26");
  assert.equal(adjacentDemoAssignmentDate(visits, "2026-12-04", "previous"), "2026-11-26");
  assert.equal(adjacentDemoAssignmentDate(visits, "2026-12-04", "next"), undefined);
});

test("adjacent days in a single visit remain one assignment, independent of input order", () => {
  assert.equal(adjacentDemoAssignmentDate(visits, "2026-11-09", "next"), "2026-11-12");
  assert.equal(adjacentDemoAssignmentDate(visits, "2026-11-10", "next"), "2026-11-12");
  assert.equal(adjacentDemoAssignmentDate(visits, "2026-11-10", "previous"), undefined);
  assert.equal(adjacentDemoAssignmentDate(visits, "2026-11-13", "previous"), "2026-11-09");
  assert.equal(adjacentDemoAssignmentDate(visits, "2026-11-27", "previous"), "2026-11-12");
});

test("idle days, duplicate fixture days and private appointments cannot create assignment visits", () => {
  assert.equal(adjacentDemoAssignmentDate(visits, "2026-11-21", "previous"), "2026-11-12");
  assert.equal(adjacentDemoAssignmentDate(visits, "2026-11-21", "next"), "2026-11-26");
  assert.equal(adjacentDemoAssignmentDate([{ date: "2026-11-20", state: "Busy", project: "Private" }], "2026-11-19", "next"), undefined);
});
