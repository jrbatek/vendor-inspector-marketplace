import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source=readFileSync("components/InspectorAvailabilityCalendar.tsx","utf8");
const browser=readFileSync("scripts/smoke-inspector-demo.mjs","utf8");

test("Calendar Month/Week/List view switches follow selected date without updating availability",()=>{
  const match=source.match(/const switchView=\(nextView:View\)=>\{([\s\S]*?)\n  \};/);
  assert.ok(match,"switchView handler must be present");
  assert.match(match[1],/selectedDay=.*start\?start:weekAnchor/);
  assert.match(match[1],/if\(nextView==="Week"\)setWeekAnchor\(selectedDay\)/);
  assert.match(match[1],/else setMonth\(selectedDay\.slice\(0,7\)\)/);
  assert.match(match[1],/setView\(nextView\)/);
  assert.doesNotMatch(match[1],/setEvents\(|setBlockState\(|supabase|fetch\(/);
  assert.match(source,/onClick=\{\(\) => switchView\(item\)\}/);
});

test("Hosted Chromium verifies Month selected date is carried into Week without losing selection",()=>{
  assert.match(browser,/Month to Week switched to stale anchor instead of selected day/);
  assert.match(browser,/Switching Month to Week lost the selected day/);
  assert.match(browser,/Choose 2026-11-25 for availability/);
});
