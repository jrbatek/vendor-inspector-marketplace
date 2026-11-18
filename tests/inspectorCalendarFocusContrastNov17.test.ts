import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const calendar=readFileSync("components/InspectorAvailabilityCalendar.tsx","utf8");
const smoke=readFileSync("scripts/smoke-inspector-demo.mjs","utf8");

test("P0-B calendar focus ring has strong dark contrast on white and mint backgrounds",()=>{
  assert.match(calendar,/\.calendarShell button:focus-visible\{outline:3px solid #115e59;outline-offset:3px;box-shadow:0 0 0 1px #fff\}/);
  assert.doesNotMatch(calendar,/button:focus-visible\{outline:3px solid #5eead4/);
  for(const selector of [".dayPicker:focus-visible",".weekPicker:focus-visible",".listPicker:focus-visible"])
    assert.ok(calendar.includes(selector),"date-cell keyboard focus missing: "+selector);
  assert.match(calendar,/\.viewTabs button\.selected\{background:#0f766e;color:#fff\}/);
  assert.match(calendar,/\.calendarShell \.connectors button\[aria-pressed=false\]\{background:#fff;color:#115e59/);
});

test("calendar browser smoke still exercises focusable Month/Week/List and disabled controls",()=>{
  for(const marker of ['Calendar view','Jump to month','Next month','Return to demo today, November 9 2026'])
    assert.ok(smoke.includes(marker),`calendar browser coverage missing: ${marker}`);
});
