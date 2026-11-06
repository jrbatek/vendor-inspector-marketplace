import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { overlapsPrivateDemoEvent } from "../lib/demoCalendarConflict";

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
