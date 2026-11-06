import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const source = fs.readFileSync("components/InspectorAvailabilityCalendar.tsx", "utf8");

test("Inspector Demo calendar opens with a current November 2026 month and realistic fictional work", () => {
  assert.match(source, /useState\("2026-11"\)/);
  assert.match(source, /useState\("2026-11-09"\)/);
  assert.match(source, /Gulf Horizon Refinery Upgrade · Piping surveillance/);
  assert.match(source, /LNG Compressor Package · Factory acceptance test/);
  for (const date of ["2026-11-09", "2026-11-10", "2026-11-12", "2026-11-13"]) {
    assert.ok(source.includes(date));
  }
});

test("all calendar views open their real synthetic assignment rather than a hard-coded one", () => {
  for (const project of ["Gulf Horizon Refinery Upgrade", "LNG Compressor Package", "Orion Deepwater Platform"]) {
    assert.match(source, new RegExp('project: "' + project + '"'));
  }
  assert.equal((source.match(/onOpenAssignment\?\.\(event\.project!\)/g) || []).length, 3);
  assert.doesNotMatch(source, /onOpenAssignment\?\.\("Orion Deepwater Platform"\)/);
  assert.match(source, /event\.state === "Assigned" && event\.project/);
});

test("inspector-only private appointments are still hidden from client availability", () => {
  assert.match(source, /Our Anniversary · All day/);
  assert.match(source, /Doctor Appointment · 10:00–11:00/);
  assert.match(source, /external: true/);
  assert.match(source, /client view: Busy/);
  assert.match(source, /event\.external/);
  assert.match(source, /synthetic demo only/);
});
