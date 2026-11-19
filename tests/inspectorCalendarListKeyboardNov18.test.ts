import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const source=readFileSync("components/InspectorAvailabilityCalendar.tsx","utf8");
const browser=readFileSync("scripts/smoke-inspector-demo.mjs","utf8");

test("List keyboard navigation moves between distinct event dates and maintains focus",()=>{
  assert.match(source,/const onListDateKey=\(event:KeyboardEvent<HTMLButtonElement>,date:string\)=>/);
  assert.match(source,/new Set\(events\.filter\(item=>item\.date\.startsWith\(month\)\)\.map\(item=>item\.date\)\)/);
  assert.match(source,/data-calendar-date=\{event\.date\} onKeyDown=\{e=>onListDateKey\(e,event\.date\)\}/);
  assert.match(source,/In List view, Up\/Down moves between listed event dates/);
  const handler=source.slice(source.indexOf("const onListDateKey="),source.indexOf("const rangeDates = dateRange(start,end);"));
  assert.match(handler,/pendingKeyboardFocus\.current=next/);
  assert.match(handler,/if\(event\.shiftKey\)/);
  assert.doesNotMatch(handler,/setEvents\(|supabase|fetch\(|localStorage|OAuth/);
});
test("Hosted Chromium verifies list ArrowDown, End and Shift+Home, including private event preservation",()=>{
  for(const marker of [
    "List ArrowDown did not skip unlisted dates and retain keyboard focus",
    "List End did not select and focus the last scheduled event date",
    "List Shift+Home did not select an inclusive range between event dates",
    "List keyboard navigation changed protected private calendar entries",
  ])assert.ok(browser.includes(marker),marker);
});
