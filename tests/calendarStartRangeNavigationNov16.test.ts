import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const source=readFileSync("components/InspectorAvailabilityCalendar.tsx","utf8");
const smoke=readFileSync("scripts/smoke-inspector-demo.mjs","utf8");

test("editing the calendar Start date moves the visible Month and Week without updating availability",()=>{
 const start=source.indexOf("const selectRangeStart=(value:string)=>{");
 const end=source.indexOf("const extendSelection =",start);
 assert.ok(start>0 && end>start,"Expected a dedicated range-start navigation handler");
 const handler=source.slice(start,end);
 for(const token of ["setStart(value)","selectionAnchor.current=value","setMonth(value.slice(0,7))","setWeekAnchor(value)","setNotice(\"\")"])
  assert.ok(handler.includes(token),`Missing ${token} in Start date navigation`);
 assert.doesNotMatch(handler,/setEvents\(|\.from\(|fetch\(/,"Date selection must be navigation-only");
 assert.match(source,/onChange=\{e => selectRangeStart\(e\.target\.value\)\}/);
 assert.match(smoke,/Editing Start date left the visible calendar on a stale month/);
 assert.match(smoke,/Editing Start date failed to synchronize the Week anchor/);
 assert.match(smoke,/Editing Start date must never write an availability event/);
});
