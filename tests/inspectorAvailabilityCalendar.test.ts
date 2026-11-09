import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const calendar = fs.readFileSync(path.join(process.cwd(), "components/InspectorAvailabilityCalendar.tsx"), "utf8");

test("Inspector availability calendar defaults to Month and offers Week/List", () => {
  assert.match(calendar, /useState<View>\("Month"\)/);
  for (const view of ["Month", "Week", "List"]) assert.match(calendar, new RegExp(`"${view}"`));
  assert.match(calendar, /role="group" aria-label="Calendar view"/);
  assert.match(calendar, /aria-pressed=\{view === item\}/);
});

test("calendar exposes all required InspectSource availability states", () => {
  for (const state of ["Available", "Tentative \/ Hold", "Assigned", "Unavailable", "Busy"]) assert.match(calendar, new RegExp(state.replace("/", "\\/")));
});

test("external demo events protect private calendar detail", () => {
  assert.match(calendar, /external: true/);
  assert.match(calendar, /Inspector only; client view: Busy/);
  assert.match(calendar, /private details hidden/);
  assert.match(calendar, /never private event details/);
  assert.match(calendar, /Doctor Appointment/);
  assert.match(calendar, /Our Anniversary · All day/);
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


test("demo calendar is wired and date blocking protects assignments", () => {
  const demo = fs.readFileSync(path.join(process.cwd(), "app/demo/inspector/page.tsx"), "utf8");
  assert.match(demo, /<InspectorAvailabilityCalendar onOpenAssignment=/);
  assert.match(calendar, /start > end/);
  assert.match(calendar, /events.some\(event => dates.includes\(event.date\) && event.state === "Assigned"\)/);
  assert.match(calendar, /setEvents\(previous/);
  assert.match(calendar, /Link Other Calendar/);
  assert.match(calendar, /Open assignment/);
});

test("calendar navigates real months and seven-day selected weeks across month boundaries",()=>{
 assert.match(calendar,/monthDays\(month\)/);
 assert.match(calendar,/getUTCDate/);
 assert.match(calendar,/getUTCDay/);
 assert.match(calendar,/stepMonth\(-1\)/);
 assert.match(calendar,/stepMonth\(1\)/);
 assert.match(calendar,/weekDates\(weekAnchor\)/);
 assert.match(calendar,/stepWeek\(1\)/);
 assert.match(calendar,/dateForDay\(day\)/);
});
test("block dates support cross-month ranges and protect assigned/private events",()=>{
 assert.match(calendar,/dateRange\(start,end\)/);
 assert.match(calendar,/length>62/);
 assert.match(calendar,/event\.external/);
 assert.doesNotMatch(calendar,/max="2026-10-31"/);
});


test("calendar week navigation follows the selected month and has accessible view controls",()=>{
 assert.match(calendar,/const selectWeek=\(anchor:string\)=>/);
 assert.match(calendar,/setMonth\(anchor\.slice\(0,7\)\)/);
 assert.match(calendar,/selectWeek\(shiftIsoDate\(weekAnchor,delta\*7\)\)/);
 assert.match(calendar,/onChange=\{e=>selectWeek\(e\.target\.value\)\}/);
 assert.match(calendar,/if\(!\/\^\\d\{4\}-\\d\{2\}-\\d\{2\}\$\/\.test\(anchor\)\)return/);
 assert.match(calendar,/role="group" aria-label="Calendar view"/);
 assert.match(calendar,/aria-pressed=\{view === item\}/);
 assert.doesNotMatch(calendar,/role="tablist"|role="tab"|aria-selected/);
});


test("month-day buttons are accessible one-click prefills, not automatic availability writes", () => {
 assert.match(calendar,/className="dayPicker"/);
 assert.match(calendar,/aria-label=\{`Choose \$\{dateForDay\(day\)\} for availability`\}/);
 assert.match(calendar,/aria-pressed=\{start===dateForDay\(day\) && end===dateForDay\(day\)\}/);
 assert.match(calendar,/setStart\(dateForDay\(day\)\);setEnd\(dateForDay\(day\)\);setNotice\("?"\)/);
 assert.match(calendar,/\.dayPicker\[aria-pressed=true\]\{background:#0f766e;color:#fff\}/);
 assert.match(calendar,/\.dayPicker:focus-visible\{outline:3px solid #0d9488/);
 assert.match(calendar,/type="button" className="dayPicker"/);
});
