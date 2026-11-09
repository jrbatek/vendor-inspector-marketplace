import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const source=readFileSync("components/InspectorAvailabilityCalendar.tsx","utf8");
const browser=readFileSync("scripts/smoke-inspector-demo.mjs","utf8");

test("Inspector Calendar offers a deterministic return-to-today across Month, Week and List",()=>{
 assert.match(source,/const DEMO_TODAY = "2026-11-09"/);
 assert.match(source,/const jumpToDemoToday = \(\) => \{/);
 for (const marker of ['setMonth(DEMO_TODAY.slice(0, 7))','setWeekAnchor(DEMO_TODAY)','setStart(DEMO_TODAY)','setEnd(DEMO_TODAY)']){
   assert.ok(source.includes(marker),marker);
 }
 assert.match(source,/aria-label="Return to demo today, November 9 2026"/);
 assert.match(source,/aria-current=\{dateForDay\(day\)===DEMO_TODAY\?"date":undefined\}/);
 assert.match(source,/aria-current=\{date===DEMO_TODAY\?"date":undefined\}/);
 assert.match(source,/aria-current=\{event.date===DEMO_TODAY\?"date":undefined\}/);
 assert.match(source,/\[aria-current=date\]\{box-shadow:0 0 0 3px #d97706\}/);
 assert.match(source,/Private titles below are visible only in this inspector demo/);
 assert.doesNotMatch(source,/supabaseBrowser|createClient|process\.env/);
});

test("Built-app Chromium tests Today after month/week navigation and private-event preservation",()=>{
 for(const marker of ["Demo today did not restore November month","Demo today did not select the correct date","Today jump did not synchronize Week anchor","Today jump changed private synthetic event data"])assert.ok(browser.includes(marker),marker);
});
