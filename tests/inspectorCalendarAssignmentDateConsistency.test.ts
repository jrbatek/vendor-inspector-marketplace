import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const calendar=fs.readFileSync("components/InspectorAvailabilityCalendar.tsx","utf8");
const details=fs.readFileSync("components/InspectorDemoAssignment.tsx","utf8");
const hub=fs.readFileSync("app/demo/inspector/page.tsx","utf8");

test("Inspector Demo calendar assigned date blocks agree with synthetic assignment detail dates",()=>{
 const cases=[
  {project:"Gulf Horizon Refinery Upgrade",days:["2026-11-09","2026-11-10"],dates:"November 9–10, 2026"},
  {project:"LNG Compressor Package",days:["2026-11-12","2026-11-13"],dates:"November 12–13, 2026"},
  {project:"Orion Deepwater Platform",days:["2026-11-26","2026-11-27"],dates:"November 26–27, 2026"},
 ];
 for(const item of cases){
  const record=details.match(new RegExp('"'+item.project.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")+'": \\{([^\\n]+)'));
  assert.ok(record, item.project+" assignment detail missing");
  assert.ok(record[1].includes('dates: "'+item.dates+'"'),item.project+" date mismatch");
  for(const day of item.days) assert.ok(calendar.includes('date: "'+day+'", state: "Assigned"') && calendar.includes(item.project),day);
 }
 assert.doesNotMatch(details,/dates: "October (?:1–3|12–14|5–6), 2026"/);
});

test("open assignments are at consistent November stages without stale due dates",()=>{
 assert.match(hub,/\["LNG Compressor Package","FAT scheduled","Confirm November FAT witness schedule"\]/);
 assert.match(details,/due: "November 6, 2026 · 12:00 CST"/);
 assert.match(details,/due: "November 16, 2026 · 17:00 CST"/);
 assert.match(details,/due: "November 18, 2026 · 09:00 KST"/);
 assert.doesNotMatch(details,/due: "October/);
 assert.match(calendar,/Our Anniversary · All day/);
 assert.match(calendar,/Doctor Appointment/);
 assert.doesNotMatch(hub,/supabaseBrowser|\.insert\(|\.update\(/);
});
