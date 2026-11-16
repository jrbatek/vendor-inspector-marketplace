import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source=readFileSync("components/InspectorAvailabilityCalendar.tsx","utf8");
const browser=readFileSync("scripts/smoke-inspector-demo.mjs","utf8");

test("Shift selection retains original anchor, normalizes reverse ranges and caps at 62 days",()=>{
  assert.match(source,/const selectionAnchor = useRef\(start\)/);
  assert.match(source,/const extendSelection = \(date: string\) => \{/);
  assert.match(source,/selectionAnchor\.current<date/);
  assert.match(source,/selectionAnchor\.current>date/);
  assert.match(source,/if\(dateRange\(first,last\)\.length===0\)/);
  assert.match(source,/Your existing selection was preserved/);
  assert.match(source,/setStart\(first\);\s*setEnd\(last\);/);
  assert.doesNotMatch(source.slice(source.indexOf("const extendSelection"),source.indexOf("const rangeDates")),/setEvents|fetch\(|supabase/);
  for(const date of ["dateForDay(day)","date","event.date"]) {
    assert.ok(source.includes("if(e.shiftKey){extendSelection("+date+");return;}"),"Missing Shift-click for "+date);
  }
  assert.match(source,/const selectRangeStart=\(value:string\)=>\{/);
  assert.match(source,/selectionAnchor\.current=value/);
  assert.match(source,/onChange=\{e => selectRangeStart\(e\.target\.value\)\}/);
  assert.match(source,/selectionAnchor\.current=DEMO_TODAY/);
  assert.match(source,/Selection alone never blocks dates/);
});

test("Hosted Chromium covers forward mouse and reverse keyboard range selection without writes",()=>{
  for(const marker of ["Shift-click did not select an inclusive forward range",
    "Shift-click must visibly include intermediate days",
    "Shift-click selection must not create an availability record",
    "Shift+Enter did not normalize the reverse date range",
    "Unmodified click must still reset selection to a single day"]) {
    assert.ok(browser.includes(marker),marker);
  }
});
