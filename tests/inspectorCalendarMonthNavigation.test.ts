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

test("Month and Week navigation dismiss outdated synthetic range warnings", () => {
  const month = source.slice(source.indexOf("const stepMonth="), source.indexOf("const jumpToMonth="));
  const week = source.slice(source.indexOf("const selectWeek="), source.indexOf("const stepWeek="));
  assert.ok(month.startsWith("const stepMonth=") && week.startsWith("const selectWeek="));
  assert.ok(month.includes('setNotice("");'), "month navigation must clear stale notice");
  assert.ok(week.includes('setNotice("");'), "week navigation must clear stale notice");
  assert.match(smoke, /Stale calendar conflict warning persisted after month navigation/);
});

test("Week browsing selects the visible week anchor instead of retaining stale Block Dates inputs", () => {
  const week = source.slice(source.indexOf("const selectWeek="), source.indexOf("const stepWeek="));
  assert.ok(week.startsWith("const selectWeek="));
  assert.ok(week.includes("setWeekAnchor(anchor);"));
  assert.ok(week.includes("setStart(anchor);"));
  assert.ok(week.includes("setEnd(anchor);"));
  assert.match(smoke, /Week navigation must select one new anchor date without changing availability/);
});

test("Built-app Chromium verifies month navigation stays Not set until explicit update", () => {
  assert.match(smoke, /Month navigation must prefill one day, not silently select a two-day block/);
  assert.match(smoke, /Second date must not appear preselected without explicit user selection/);
  assert.match(smoke, /Browsing a month must not silently declare availability/);
});


test("Calendar dates make invalid ranges and private conflicts visibly distinguishable from success", () => {
  assert.match(source, /const invalidRange = !start \|\| !end \|\| dateRange\(start,end\)\.length === 0/);
  assert.match(source, /aria-invalid=\{invalidRange\}/);
  assert.match(source, /calendar-range-warning/);
  assert.match(source, /className=\{noticeIsWarning \? "notice warning" : "notice"\}/);
  assert.match(source, /\.availabilityActions input\[aria-invalid=true\]/);
  assert.match(smoke, /Reversed calendar date field must be visibly invalid/);
  assert.match(smoke, /Calendar private-event conflict must be visibly distinct from green success/);
});
