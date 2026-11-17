import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const calendar=readFileSync("components/InspectorAvailabilityCalendar.tsx","utf8");
const browser=readFileSync("scripts/smoke-inspector-demo.mjs","utf8");

test("Month and Week day buttons support arrow navigation with focus and Shift selection",()=>{
 assert.match(calendar,/const onDateArrow=\(event:KeyboardEvent<HTMLButtonElement>,date:string\)=>/);
 assert.match(calendar,/ArrowLeft:-1,ArrowRight:1,ArrowUp:-7,ArrowDown:7/);
 assert.match(calendar,/if\(event.shiftKey\)extendSelection\(next\)/);
 assert.match(calendar,/pendingKeyboardFocus.current=next/);
 assert.match(calendar,/data-calendar-date=\{dateForDay\(day\)\}/);
 assert.match(calendar,/data-calendar-date=\{date\}/);
 assert.match(calendar,/onKeyDown=\{e=>onDateArrow\(e,dateForDay\(day\)\)\}/);
 assert.match(calendar,/onKeyDown=\{e=>onDateArrow\(e,date\)\}/);
 const handler=calendar.slice(calendar.indexOf("const onDateArrow="),calendar.indexOf("const rangeDates"));
 assert.doesNotMatch(handler,/setEvents|supabase|fetch\(|localStorage|OAuth/);
});

test("hosted Chromium covers cross-month/day/week focus without synthetic availability writes",()=>{
 for(const marker of ["Calendar right-arrow navigation did not cross into December","Calendar keyboard focus did not follow the arrow-selected date","Shift-arrow calendar range did not include dates across month boundary","Week arrow-down did not retain keyboard focus after advancing a week"])assert.ok(browser.includes(marker),marker);
});
