import assert from "node:assert/strict";
import test from "node:test";
import { countProtectedDemoAvailabilityDays } from "../lib/demoCalendarConflict";

test("Calendar impact counts distinct dates when an inspection and private appointment overlap", () => {
  const events=[
    {date:"2026-11-09",state:"Assigned"},
    {date:"2026-11-09",state:"Busy",external:true},
    {date:"2026-11-10",state:"Assigned"},
    {date:"2026-11-10",state:"Assigned"},
    {date:"2026-11-11",state:"Busy",external:false},
    {date:"2026-11-12",state:"Busy",external:true},
    {date:"2026-11-13",state:"Unavailable"},
  ];
  assert.equal(countProtectedDemoAvailabilityDays(events,
    ["2026-11-09","2026-11-10","2026-11-11","2026-11-12","2026-11-13"]),3);
  assert.equal(countProtectedDemoAvailabilityDays(events,["2026-11-11","2026-11-13"]),0);
  assert.equal(countProtectedDemoAvailabilityDays(events,[]),0);
  assert.equal(countProtectedDemoAvailabilityDays(events,["2026-11-09","2026-11-09"]),1);
});
