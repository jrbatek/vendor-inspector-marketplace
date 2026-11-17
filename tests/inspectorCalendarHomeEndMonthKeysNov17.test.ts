import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const source=readFileSync("components/InspectorAvailabilityCalendar.tsx","utf8");
const smoke=readFileSync("scripts/smoke-inspector-demo.mjs","utf8");

test("Home/End and PageUp/PageDown navigate Month/Week without writing synthetic availability",()=>{
  assert.match(source,/const shiftCalendarMonth = \(iso: string, offset: number\) =>/);
  assert.match(source,/Math\.min\(day,lastDay\)/);
  for(const name of ["Home","End","PageUp","PageDown"]) assert.ok(source.includes('"'+name+'"'),name);
  const handler=source.slice(source.indexOf("const onDateArrow="),source.indexOf("const rangeDates"));
  assert.match(handler,/event\.shiftKey\)extendSelection\(next\)/);
  assert.match(handler,/pendingKeyboardFocus\.current=next/);
  assert.doesNotMatch(handler,/setEvents|supabase|fetch\(|localStorage/);
  assert.match(source,/Hold Shift with a navigation key to extend the selection/);
});

test("Chromium covers Sunday, Saturday, adjacent-month focus, and Shift+Home range",()=>{
  for(const message of [
    "Home key did not select and focus the Sunday of the current week",
    "End key did not select and focus the Saturday of the current week",
    "PageDown did not move the calendar and keyboard focus to the next month",
    "PageUp did not restore the previous month and selected date",
    "Shift+Home did not select the inclusive calendar week range",
    "Keyboard range navigation must not create any availability records",
  ])assert.ok(smoke.includes(message),message);
});
