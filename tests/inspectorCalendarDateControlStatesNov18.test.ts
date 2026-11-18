import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const calendar=readFileSync("components/InspectorAvailabilityCalendar.tsx","utf8");
const smoke=readFileSync("scripts/smoke-demo-control-visibility.mjs","utf8");

test("Inspector Calendar date controls distinguish legible disabled states across Month, Week and List",()=>{
  assert.match(calendar,/\.dayPicker:disabled,\.calendarShell \.weekPicker:disabled,\.calendarShell \.listPicker:disabled/);
  assert.match(calendar,/background:#f1f5f9;color:#334155;border-color:#94a3b8;opacity:1;cursor:not-allowed/);
  assert.match(calendar,/\.dayPicker\[aria-pressed=true\]\{background:#0f766e;color:#fff/);
  assert.match(calendar,/\.dayPicker:focus-visible\{outline:3px solid #0d9488/);
});

test("real desktop and mobile Chromium exercise Calendar selected, unselected, hover, keyboard and disabled states",()=>{
  assert.match(smoke,/for \(const width of \[1440, 390\]\)/);
  for(const marker of [
    "Calendar dates lost initial unselected/selected state",
    "Calendar selected/unselected date unreadable",
    "Calendar hovered date unreadable",
    "Calendar keyboard date has no visible focus outline",
    "Calendar disabled date unreadable"
  ])assert.ok(smoke.includes(marker),marker);
  assert.ok(smoke.includes("element.disabled=true") && smoke.includes("element.disabled=false"));
});
