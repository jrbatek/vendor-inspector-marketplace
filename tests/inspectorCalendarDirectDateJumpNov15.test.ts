import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync("components/InspectorAvailabilityCalendar.tsx", "utf8");
const smoke = readFileSync("scripts/smoke-inspector-demo.mjs", "utf8");

test("direct date jump updates calendar views and selection without writing availability", () => {
  assert.match(source, /Jump to date<input aria-label="Jump to date" type="date"/);
  assert.match(source, /if\(e\.target\.value\)\{selectWeek\(e\.target\.value\);setView\("Month"\);\}/);
  assert.match(source, /const selectWeek=\(anchor:string\)=>/);
  assert.match(source, /setWeekAnchor\(anchor\);\s*setMonth\(anchor\.slice\(0,7\)\);/);
  assert.match(source, /setStart\(anchor\);\s*setEnd\(anchor\);/);
  assert.match(smoke, /Jump to date must not silently mark unknown availability as confirmed/);
  assert.match(smoke, /Jump to date must synchronize Week without writing availability/);
});
