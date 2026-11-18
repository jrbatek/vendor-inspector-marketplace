import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const detail=fs.readFileSync("components/InspectorDemoAssignment.tsx","utf8");

test("fictional November 17 snapshot does not describe already witnessed jobs as still scheduled",()=>{
 for(const marker of [
  '"LNG Compressor Package": { status: "FAT evidence review"',
  '"Gulf Horizon Refinery Upgrade": { status: "NCR follow-up"',
  '"Orion Deepwater Platform": { status: "Travel pending"',
  'November 13 · Mechanical FAT witnessed; calibration documentation punch item recorded',
  'November 10 · Piping surveillance completed; heat-number traceability NCR recorded',
  'Mechanical FAT witnessed; calibration evidence incomplete',
  'Weld surveillance and hydrotest evidence collected',
  'DEMO-PUNCH-4102','DEMO-NCR-4118'
 ]) assert.ok(detail.includes(marker),marker);
 assert.ok(!detail.includes('"LNG Compressor Package": { status: "FAT scheduled"'));
 assert.ok(!detail.includes('"Gulf Horizon Refinery Upgrade": { status: "Scheduled"'));
});

test("past witness events are complete, while reporting and corrective work remain unresolved",()=>{
 for(const phrase of [
  '{ name: "Submit FAT report and release evidence", date: "November 16", status: "Overdue" }',
  '{ name: "Submit piping inspection report", date: "November 11", status: "Overdue" }',
  '{ name: "Witness package FAT", date: "November 26–27", status: "Scheduled" }',
  'Fictional action register · status snapshot as of November 17, 2026.',
  'No NCR issued. This fictional assignment has not yet reached its scheduled FAT witness',
  'Open · Not a formal NCR',
  'Open · Minor (fictional)'
 ]) assert.ok(detail.includes(phrase),phrase);
 assert.doesNotMatch(detail,/supabase|fetch\(|\.insert\(|\.update\(|\.delete\(/);
});

test("summary due dates match earliest still-outstanding fictional action, including overdue tasks",()=>{
 assert.ok(detail.includes('due: "November 13, 2026 · 17:00 CST"'),"Compressor summary must match calibration certificate due November 13");
 assert.ok(detail.includes('due: "November 10, 2026 · 12:00 CST"'),"Gulf summary must match vendor traceability evidence due November 10");
 assert.ok(detail.includes('due: "November 18, 2026 · 09:00 KST"'),"Orion summary must match site access due November 18");
});
