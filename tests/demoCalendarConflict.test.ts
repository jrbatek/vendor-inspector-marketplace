import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { clearInspectorAddedDemoAvailability, overlapsPrivateDemoEvent } from "../lib/demoCalendarConflict";

const doctor = { date: "2026-11-20", state: "Busy", external: true };
const anniversary = { date: "2026-11-18", state: "Busy", external: true };
const internalHold = { date: "2026-11-20", state: "Tentative / Hold" };
const syntheticBusy = { date: "2026-11-22", state: "Busy" };

test("linked private Busy events cannot be overwritten by calendar blocking actions", () => {
  assert.equal(overlapsPrivateDemoEvent([doctor, anniversary], ["2026-11-18"]), true);
  assert.equal(overlapsPrivateDemoEvent([doctor, anniversary], ["2026-11-19", "2026-11-20"]), true);
  assert.equal(overlapsPrivateDemoEvent([doctor], ["2026-11-01", "2026-11-30"]), false);
  assert.equal(overlapsPrivateDemoEvent([doctor], []), false);
});

test("ordinary synthetic holds and non-linked Busy entries remain editable", () => {
  assert.equal(overlapsPrivateDemoEvent([internalHold, syntheticBusy], ["2026-11-20", "2026-11-22"]), false);
  assert.equal(overlapsPrivateDemoEvent([{ date: "2026-11-20", state: "Available", external: true }], ["2026-11-20"]), false);
});

test("Inspector Demo validates selected dates before mutating browser-local events", () => {
  const calendar = fs.readFileSync("components/InspectorAvailabilityCalendar.tsx", "utf8");
  const privateCheck = calendar.indexOf("if (overlapsPrivateDemoEvent(events, dates))");
  const update = calendar.indexOf("setEvents(previous =>");
  assert.ok(privateCheck > 0 && update > privateCheck);
  assert.match(calendar, /private calendar events cannot be overridden in this demo/);
  assert.match(calendar, /event\.external/);
  assert.match(calendar, /client view: Busy/);
});

test("clearing inspector-added dates restores seeded sample states and preserves private/assigned records",()=>{
 const baseline=[
  {date:"2026-11-23",state:"Available",label:"Available"},
  {date:"2026-11-18",state:"Busy",label:"Our Anniversary · All day",external:true},
  {date:"2026-11-26",state:"Assigned",label:"Orion Deepwater Platform"}
 ];
 const current=[baseline[1],baseline[2],
  {date:"2026-11-23",state:"Unavailable",label:"Unavailable",manuallySet:true},
  {date:"2026-11-29",state:"Tentative / Hold",label:"Tentative / Hold",manuallySet:true},
  {date:"2026-12-01",state:"Busy",label:"Personal Busy",manuallySet:true}];
 const result=clearInspectorAddedDemoAvailability(current,baseline,["2026-11-23","2026-11-29"]);
 assert.equal(result.cleared,2);
 assert.deepEqual(result.events.filter(row=>row.date==="2026-11-23"),[baseline[0]],"Seeded availability must be restored");
 assert.equal(result.events.filter(row=>row.date==="2026-11-29").length,0,"User-added day must return to Not set");
 assert.ok(result.events.includes(baseline[1])&&result.events.includes(baseline[2]),"Private and assigned fixtures must persist");
 assert.equal(result.events.find(row=>row.date==="2026-12-01")?.manuallySet,true,"Other dates must remain intact");
 const unchanged=clearInspectorAddedDemoAvailability(result.events,baseline,["2026-11-18","2026-11-26"]);
 assert.equal(unchanged.cleared,0);
 assert.deepEqual(unchanged.events,result.events);
});
