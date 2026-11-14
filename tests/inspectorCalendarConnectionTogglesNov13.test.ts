import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const calendar = readFileSync("components/InspectorAvailabilityCalendar.tsx", "utf8");
const smoke = readFileSync("scripts/smoke-inspector-demo.mjs", "utf8");

test("Calendar connections maintain browser-local independent link states without real OAuth or storage", () => {
 assert.match(calendar, /type CalendarProvider = "Google Calendar" \| "Outlook Calendar" \| "Other Calendar"/);
 assert.match(calendar, /useState<Record<CalendarProvider, boolean>>/);
 assert.match(calendar, /"Google Calendar": true, "Outlook Calendar": false, "Other Calendar": false/);
 assert.match(calendar, /setCalendarConnections\(previous => \(\{ \.\.\.previous, \[provider\]: !previous\[provider\] \}\)\)/);
 assert.match(calendar, /Private sample calendar events remain unchanged/);
 assert.doesNotMatch(calendar, /localStorage|sessionStorage|supabaseBrowser|fetch\(/);
});
test("Linked and unlinked provider buttons have accessible, explicit, legible states", () => {
 for(const provider of ["Google Calendar", "Outlook Calendar", "Other Calendar"]) {
  assert.ok(calendar.includes(`aria-pressed={calendarConnections["${provider}"]}`));
 }
 assert.match(calendar, /className="connectionStatus" role="status"/);
 assert.match(calendar, /\.calendarShell \.connectors button\[aria-pressed=false\]\{background:#fff;color:#115e59/);
 assert.match(calendar, /\.calendarShell \.connectors button\[aria-pressed=false\]:hover\{background:#ccfbf1;color:#064e3b/);
 assert.match(calendar, /\.calendarShell \.connectors button\[aria-pressed=true\]\{box-shadow:/);
});
test("Hosted Chromium checks connection toggles, contrasted labels and private appointments", () => {
 for(const marker of ["Google demo connection should start linked","Outlook demo connection did not show the linked state","Other Calendar demo connection did not show the linked state","Google demo connection cannot be unlinked","Google demo connection did not relink","Unlinked calendar controls must remain visible on white","Simulated connection toggles altered private inspector sample events"]) {
  assert.ok(smoke.includes(marker),marker);
 }
});
