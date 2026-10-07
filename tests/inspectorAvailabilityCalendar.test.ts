import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const calendar = fs.readFileSync(path.join(process.cwd(), "components/InspectorAvailabilityCalendar.tsx"), "utf8");

test("Inspector availability calendar defaults to Month and offers Week/List", () => {
  assert.match(calendar, /useState<View>\("Month"\)/);
  for (const view of ["Month", "Week", "List"]) assert.match(calendar, new RegExp(`"${view}"`));
  assert.match(calendar, /role="tablist"/);
  assert.match(calendar, /aria-selected=\{view === item\}/);
});

test("calendar exposes all required InspectSource availability states", () => {
  for (const state of ["Available", "Tentative \/ Hold", "Assigned", "Unavailable", "Busy"]) assert.match(calendar, new RegExp(state.replace("/", "\\/")));
});

test("external demo events protect private calendar detail", () => {
  assert.match(calendar, /external: true/);
  assert.match(calendar, /event\.external \? "Busy" : event\.label/);
  assert.match(calendar, /private details hidden/);
  assert.match(calendar, /never private event details/);
});

test("calendar integrations are explicitly synthetic and do not claim live sync", () => {
  assert.match(calendar, /Google Calendar · Connected \(demo\)/);
  assert.match(calendar, /Connect Outlook Calendar/);
  assert.match(calendar, /OAuth\/sync is not enabled/);
  assert.match(calendar, /Real Google\/Outlook OAuth, calendar permissions and synchronization require reviewed production integration work/);
});

test("availability controls have visible interaction states", () => {
  assert.match(calendar, /\.calendarShell button\{[^}]*background:#0f766e[^}]*color:#fff/);
  assert.match(calendar, /button:hover\{background:#115e59/);
  assert.match(calendar, /button:focus-visible\{outline:3px solid #5eead4/);
  assert.match(calendar, /\.viewTabs button\.selected\{background:#0f766e;color:#fff/);
});
