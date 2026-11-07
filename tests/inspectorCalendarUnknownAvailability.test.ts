import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const calendar = fs.readFileSync("components/InspectorAvailabilityCalendar.tsx", "utf8");

test("Calendar does not advertise unknown dates as confirmed inspector availability", () => {
  assert.match(calendar, /Unmarked dates are not confirmed available/);
  assert.match(calendar, /const UnmarkedDate = \(\) => <span className="not-set"/);
  assert.match(calendar, /dayEvents\.length === 0 && <UnmarkedDate \/>/);
  assert.match(calendar, /:<UnmarkedDate \/>/);
  assert.doesNotMatch(calendar, /<span className="available">Available<\/span>/);
});

test("Unavailable-to-verify days are clearly distinguished from declared available days", () => {
  assert.match(calendar, /<span className="not-set">Not set<\/span><\/div>/);
  assert.match(calendar, /\.not-set\{background:#f1f5f9;color:#475569/);
  assert.match(calendar, /date: "2026-11-23", state: "Available"/);
  assert.match(calendar, /No inspector availability confirmed for this date/);
});

test("Calendar continues to protect assigned and linked private Busy dates", () => {
  assert.match(calendar, /state === "Assigned"/);
  assert.match(calendar, /overlapsPrivateDemoEvent\(events, dates\)/);
  assert.match(calendar, /Our Anniversary · All day/);
  assert.match(calendar, /Doctor Appointment/);
});
