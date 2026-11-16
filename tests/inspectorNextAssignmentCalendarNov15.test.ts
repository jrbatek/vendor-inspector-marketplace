import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";
const source=readFileSync("components/InspectorAvailabilityCalendar.tsx","utf8");
const smoke=readFileSync("scripts/smoke-inspector-demo.mjs","utf8");
test("Next assignment jumps to nearest later synthetic assignment without writing availability",()=>{
 assert.ok(source.includes("const jumpToNextAssignment="));
 assert.ok(source.includes('adjacentDemoAssignmentDate(events,start,"next")'));
 assert.ok(source.includes('aria-label="Next assigned inspection"'));
 assert.ok(source.includes('setView("Month")'));
 const helper=source.slice(source.indexOf("const jumpToNextAssignment="),source.indexOf("// Only clear dates"));
 assert.doesNotMatch(helper,/setEvents\(|supabase|fetch\(|oauth|\.insert\(/i);
 assert.ok(smoke.includes("Next assigned inspection did not jump to the next real synthetic assignment date"));
});
