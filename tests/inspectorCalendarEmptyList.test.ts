import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const src=fs.readFileSync("components/InspectorAvailabilityCalendar.tsx","utf8");
const smoke=fs.readFileSync("scripts/smoke-inspector-demo.mjs","utf8");

test("Calendar List explicitly explains empty fictional months without declaring availability",()=>{
  assert.match(src,/const listEvents=events\.filter\(event=>event.date.startsWith\(month\)\)/);
  assert.match(src,/listEvents.length===0 \? <section className="emptyList" role="status">/);
  assert.match(src,/No scheduled demo events in \{monthLabel\}/);
  assert.match(src,/Unmarked days are Not set, not confirmed available/);
  assert.match(src,/onClick=\{\(\)=>setView\("Month"\)\}>Open Month calendar/);
  assert.match(src,/\.emptyList\{padding:18px;border:1px solid #94a3b8/);
  assert.match(src,/\.calendarShell button:focus-visible/);
});
test("Chromium Inspector Demo covers no-event List and month recovery",()=>{
  assert.match(smoke,/getByText\("No scheduled demo events in February 2027"\)/);
  assert.match(smoke,/getByRole\("button",\{name:"Open Month calendar"\}\)\.click\(\)/);
  assert.match(smoke,/Month view/);
});
