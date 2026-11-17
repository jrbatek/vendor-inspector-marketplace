import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";

const calendar=readFileSync("components/InspectorAvailabilityCalendar.tsx","utf8");
const browser=readFileSync("scripts/smoke-inspector-demo.mjs","utf8");

test("editing End date reveals its month/week without writing synthetic availability",()=>{
 const handler=calendar.slice(calendar.indexOf("const selectRangeEnd="),calendar.indexOf("const extendSelection ="));
 assert.match(handler,/setEnd\(value\)/);
 assert.match(handler,/setMonth\(value\.slice\(0,7\)\)/);
 assert.match(handler,/setWeekAnchor\(value\)/);
 assert.doesNotMatch(handler,/setStart\(|selectionAnchor\.current|setEvents\(|fetch\(/);
 assert.match(calendar,/onChange=\{e => selectRangeEnd\(e\.target\.value\)\}/);
 assert.match(browser,/Editing End date must preserve the inspector's selected Start date/);
 assert.match(browser,/Editing End date must not silently create available or busy records/);
});
