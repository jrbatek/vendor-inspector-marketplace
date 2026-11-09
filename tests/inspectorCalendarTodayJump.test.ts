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

test("Inspector Calendar month picker navigates without changing availability or exposing private data",()=>{
 assert.match(source,/const jumpToMonth=\(value:string\)=>/);
 assert.match(source,/onChange=\{e=>jumpToMonth\(e.target.value\)\}/);
 assert.match(source,/aria-label="Jump to month" type="month" value=\{month\}/);
 for(const state of ['setMonth(value)','setWeekAnchor(firstDay)','setStart(firstDay)','setEnd(firstDay)']) assert.ok(source.includes(state),state);
 for(const state of ['.monthJump input{background:#fff;color:#0f172a','.monthJump input:focus-visible','.monthJump input:disabled{background:#f1f5f9;color:#334155']) assert.ok(source.includes(state),state);
 assert.match(browser,/Month jump did not synchronize Week anchor/);
 assert.match(browser,/Month selection must not change availability/);
 assert.match(browser,/Month jump lost private appointment data/);
 assert.doesNotMatch(source,/fetch\(|OAuth\/sync is enabled/);
});
