import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const source=fs.readFileSync("components/InspectorAvailabilityCalendar.tsx","utf8");
const smoke=fs.readFileSync("scripts/smoke-inspector-demo.mjs","utf8");

test("Month Week and List consistently mark the full inspector-selected date range",()=>{
  assert.ok(source.includes("const isDateSelected = (date: string) => start <= end && date >= start && date <= end;"));
  for (const expression of [
    "aria-pressed={isDateSelected(dateForDay(day))}",
    "aria-pressed={isDateSelected(date)}",
    "aria-pressed={isDateSelected(event.date)}"
  ]) assert.ok(source.includes(expression),expression);
  assert.ok(source.includes(".calendarShell .dayPicker[aria-pressed=true]"));
  assert.ok(source.includes(".calendarShell .weekPicker[aria-pressed=true]"));
  assert.ok(source.includes(".calendarShell .listPicker[aria-pressed=true]"));
});
test("Built-app Chromium covers multi-day visibility and never writes on selection",()=>{
  assert.ok(smoke.includes('["2026-11-28", "2026-11-29", "2026-11-30"]'));
  assert.ok(smoke.includes("Highlighting a range must not silently declare dates Available"));
  assert.ok(smoke.includes("Reversed range must never indicate selected dates"));
});
