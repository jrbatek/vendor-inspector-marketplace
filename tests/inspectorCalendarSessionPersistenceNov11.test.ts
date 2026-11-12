import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const demo=readFileSync("app/demo/inspector/page.tsx","utf8");
const calendar=readFileSync("components/InspectorAvailabilityCalendar.tsx","utf8");
const smoke=readFileSync("scripts/smoke-inspector-demo.mjs","utf8");

test("InspectorHub keeps Calendar mounted and accessible in the continuous scroll workspace",()=>{
 assert.match(demo,/id="calendar" className="panel calendarPane demoSection" aria-label="Availability & Calendar"/);
 assert.match(demo,/\.demoSection\{scroll-margin-top:24px/);
 assert.doesNotMatch(demo,/hidden=\{section!=="calendar"\}/);
 assert.match(demo,/InspectorAvailabilityCalendar onOpenAssignment=\{project =>/);
 assert.match(demo,/setAssignment\(project\);setSection\("assignments"\)/);
});

test("Calendar edits stay synthetic and browser-local, protecting private events and assigned work",()=>{
 assert.match(calendar,/const \[events, setEvents\] = useState\(DEMO_EVENTS\)/);
 assert.match(calendar,/overlapsPrivateDemoEvent\(events, dates\)/);
 assert.match(calendar,/clearInspectorAddedDemoAvailability\(events,DEMO_EVENTS,dates\)/);
 assert.doesNotMatch(calendar,/localStorage|sessionStorage|supabase/);
});

test("Hosted Chromium checks persistent calendar and continuous scroll accessibility",()=>{
 for(const marker of [
  "Inspector-added demo Block Dates disappeared after sidebar navigation",
  "Calendar must remain in the continuous page when scrolling to other sections",
  "Returning to Calendar lost the inspector-selected date",
  "Returning to Calendar changed the selected calendar view"
 ])assert.ok(smoke.includes(marker),marker);
 assert.ok(smoke.indexOf("Demo block did not display an Unavailable calendar event")<
    smoke.indexOf("Inspector-added demo Block Dates disappeared after sidebar navigation"));
 assert.ok(smoke.indexOf("Inspector-added demo Block Dates disappeared after sidebar navigation")<
    smoke.indexOf('Clear inspector-added demo dates'));
});
