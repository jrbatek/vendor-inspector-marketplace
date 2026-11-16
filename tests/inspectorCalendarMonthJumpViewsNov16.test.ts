import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source=readFileSync("components/InspectorAvailabilityCalendar.tsx","utf8");
const browser=readFileSync("scripts/smoke-inspector-demo.mjs","utf8");

test("Calendar month-level controls always reveal Month view without changing availability",()=>{
  for(const [start,end] of [["const stepMonth=","const jumpToMonth="],
                             ["const jumpToMonth=","const selectWeek="]]){
    const handler=source.slice(source.indexOf(start),source.indexOf(end));
    assert.ok(handler.startsWith(start), "Missing calendar month handler "+start);
    assert.match(handler,/setView\("Month"\)/, "Month navigation should open the entire month grid");
    assert.match(handler,/setWeekAnchor\(/, "Week anchor must stay synchronized");
    assert.match(handler,/setStart\(/, "Selected date must remain synchronized");
    assert.match(handler,/setEnd\(/, "Date range must remain synchronized");
    assert.doesNotMatch(handler,/setEvents\(|\.from\(|fetch\(/,"Navigation must not write availability");
  }
  assert.match(browser,/Jump to month from List did not open the full Month calendar/);
  assert.match(browser,/Next month from Week left the inspector on a one-week view/);
  assert.match(browser,/Next month from Week must prefill one March day, not mutate availability/);
});
