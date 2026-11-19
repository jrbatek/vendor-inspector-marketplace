import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";

const calendar=readFileSync("components/InspectorAvailabilityCalendar.tsx","utf8");
const smoke=readFileSync("scripts/smoke-inspector-demo.mjs","utf8");

test("Month, Week and List assignment buttons share a legible 44px mobile-safe target",()=>{
  assert.equal((calendar.match(/className="assignmentAction"/g)||[]).length,3);
  assert.equal((calendar.match(/title={`Open \$\{event.project\} assignment details`}/g)||[]).length,3);
  assert.match(calendar,/\.calendarShell \.assignmentAction\{[^}]*min-height:44px;max-width:100%;white-space:normal/);
  assert.match(calendar,/\.calendarShell \.assignmentAction\{[^}]*overflow-wrap:anywhere/);
  assert.doesNotMatch(calendar,/className="assignmentAction"[^>]*disabled/);
});

test("Chromium checks project descriptions and 44px targets for all calendar layouts",()=>{
  assert.match(smoke,/for \(const width of \[1440, 390\]\)/);
  assert.ok(smoke.includes("Calendar Open assignment touch target too small or overflowing"));
  assert.ok(smoke.includes("Calendar Open assignment lacks a project-specific description"));
  assert.ok(smoke.includes("Week Open assignment target must be at least 44px tall"));
  assert.ok(smoke.includes("List Open assignment target must be at least 44px tall"));
});
