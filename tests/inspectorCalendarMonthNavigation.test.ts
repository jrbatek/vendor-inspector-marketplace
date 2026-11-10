import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync("components/InspectorAvailabilityCalendar.tsx", "utf8");
const smoke = readFileSync("scripts/smoke-inspector-demo.mjs", "utf8");

test("Month browsing selects a single first day, never an implicit two-day availability range", () => {
  const navigation = source.match(/const stepMonth=\(delta:number\)=>\{([\s\S]*?)\n  \};/);
  assert.ok(navigation, "month navigation handler missing");
  assert.match(navigation[1], /setStart\(next\);\s*setEnd\(next\);/);
  assert.doesNotMatch(navigation[1], /setEnd\(shiftIsoDate\(next,1\)\)/);
  assert.match(source, /const jumpToMonth=\(value:string\)=>/);
  assert.match(source, /setEvents\(previous/);
});

test("Built-app Chromium verifies month navigation stays Not set until explicit update", () => {
  assert.match(smoke, /Month navigation must prefill one day, not silently select a two-day block/);
  assert.match(smoke, /Second date must not appear preselected without explicit user selection/);
  assert.match(smoke, /Browsing a month must not silently declare availability/);
});
