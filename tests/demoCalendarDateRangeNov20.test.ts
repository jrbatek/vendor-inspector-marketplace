import assert from "node:assert/strict";
import test from "node:test";
import { demoCalendarDateRange } from "../lib/demoCalendarDateRange";

test("Calendar Block dates uses real UTC days and rejects JS date rollover", () => {
 assert.deepEqual(demoCalendarDateRange("2026-02-30","2026-03-02"), []);
 assert.deepEqual(demoCalendarDateRange("2026-04-31","2026-05-01"), []);
 assert.deepEqual(demoCalendarDateRange("2026-13-01","2026-13-02"), []);
 assert.deepEqual(demoCalendarDateRange("2026-00-12","2026-01-12"), []);
 assert.deepEqual(demoCalendarDateRange("2026-11-09","2026-11-08"), []);
 assert.deepEqual(demoCalendarDateRange("","2026-11-08"), []);
 assert.deepEqual(demoCalendarDateRange("2028-02-28","2028-03-01"), ["2028-02-28","2028-02-29","2028-03-01"]);
 assert.deepEqual(demoCalendarDateRange("2027-02-29","2027-03-01"), []);
 assert.deepEqual(demoCalendarDateRange("2026-03-07","2026-03-10"),["2026-03-07","2026-03-08","2026-03-09","2026-03-10"]);
 assert.equal(demoCalendarDateRange("2026-11-09","2027-01-09").length, 62);
 assert.deepEqual(demoCalendarDateRange("2026-11-09","2027-01-10"), []);
 assert.deepEqual(demoCalendarDateRange("2026-11-22","2026-11-23"),["2026-11-22","2026-11-23"]);
});
