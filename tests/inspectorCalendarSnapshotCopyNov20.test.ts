import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const calendar = readFileSync("components/InspectorAvailabilityCalendar.tsx", "utf8");
const smoke = readFileSync("scripts/smoke-inspector-demo.mjs", "utf8");

test("Inspector Calendar distinguishes its fictional Nov 9 baseline from today's actual date", () => {
  assert.match(calendar, /const DEMO_TODAY = "2026-11-09"/);
  assert.match(calendar, /fixed November 9, 2026 snapshot, not today's actual date/);
  assert.match(calendar, /Demo snapshot · Nov 9/);
  assert.match(calendar, /Return to fictional demo snapshot, November 9 2026/);
  assert.doesNotMatch(calendar, />Today · Nov 9 \(demo\)</);
});

test("Hosted browser navigation continues to exercise the renamed calendar snapshot reset", () => {
  assert.ok(smoke.includes("Return to fictional demo snapshot, November 9 2026"));
  assert.ok(!smoke.includes("Return to demo today, November 9 2026"));
});
