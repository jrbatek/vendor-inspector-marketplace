import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";
const source=readFileSync("components/InspectorAvailabilityCalendar.tsx","utf8");
const smoke=readFileSync("scripts/smoke-inspector-demo.mjs","utf8");
test("Previous assignment navigates to nearest earlier fictional inspection without modifying calendar records",()=>{
 const prior=source.slice(source.indexOf("const jumpToPreviousAssignment="),source.indexOf("// Only clear dates"));
 assert.ok(prior.includes('adjacentDemoAssignmentDate(events,start,"previous")'));
 assert.ok(source.includes("adjacentDemoAssignmentDate"));
 assert.ok(prior.includes('selectWeek(previousDate)'));
 assert.ok(prior.includes('setView("Month")'));
 assert.match(prior,/No earlier assigned demo inspections/);
 assert.doesNotMatch(prior,/setEvents\(|supabase|fetch\(|oauth|\.insert\(/i);
 assert.ok(source.includes('aria-label="Previous assigned inspection"'));
 assert.ok(smoke.includes("Previous assignment must land on the earlier distinct project, not its final inspection day"));
 assert.ok(smoke.includes("No-previous-assignment response must preserve the current selection"));
});
