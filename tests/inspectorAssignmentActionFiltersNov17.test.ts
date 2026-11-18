import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const component = fs.readFileSync("components/InspectorDemoAssignment.tsx", "utf8");
const smoke = fs.readFileSync("scripts/smoke-inspector-demo.mjs", "utf8");

test("synthetic inspector action triage is accessible, dated and never writes to production", () => {
  assert.match(component, /role="group" aria-label="Filter synthetic outstanding actions"/);
  for (const label of ["All actions (", "Overdue (", "Upcoming (", "No overdue", "No upcoming"]) {
    if (label.startsWith("No ")) continue; // Empty text is dynamically generated below.
    assert.ok(component.includes(label), label);
  }
  assert.match(component, /No \{actionFilter === "overdue" \? "overdue" : "upcoming"\} actions/);
  assert.match(component, /aria-pressed=\{actionFilter === "overdue"\}/);
  assert.match(component, /item\.dueIso < ACTION_SNAPSHOT_DATE/);
  assert.match(component, /item\.dueIso >= ACTION_SNAPSHOT_DATE/);
  assert.match(component, /\.actionFilters button:focus-visible\{outline:3px solid #0d9488/);
  assert.match(component, /\.actionFilters button\[aria-pressed=true\]\{background:#115e59;color:#fff/);
  assert.doesNotMatch(component, /supabase|fetch\(|\.insert\(|\.delete\(|\.update\(/);
});

test("real Chromium checks overdue/upcoming empty states and restoring all actions", () => {
  assert.match(smoke, /expectedOverdue=name==="Orion Deepwater Platform"\?0:2/);
  assert.match(smoke, /filtered overdue action count disagrees/);
  assert.match(smoke, /filtered upcoming action count disagrees/);
  assert.match(smoke, /Reset must restore both fictional action rows/);
});
