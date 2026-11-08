import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import { exportSyntheticEarningsCsv } from "../lib/inspectorIncomeExport";

const items = [
  {id:"S-26",year:2026,client:"Demo client",project:"Valves, FAT",type:"Contractor" as const,gross:500,paid:"2026-09-28"},
  {id:"S-25",year:2025,client:"=HYPERLINK(\"https://example.test\")",project:"Tester",type:"Employee" as const,gross:400,paid:"2025-05-05"},
];
test("Income CSV includes only selected-year synthetic earnings with immutable data-through",()=>{
 const csv=exportSyntheticEarningsCsv(items,2026,"2026-11-01T23:59:59-06:00");
 assert.match(csv,/SYNTHETIC DEMO - NOT VERIFIED/);
 assert.match(csv,/2026-11-01T23:59:59-06:00/);
 assert.match(csv,/"Valves, FAT"/);
 assert.match(csv,/S-26/);
 assert.doesNotMatch(csv,/S-25/);
 assert.equal(csv.trim().split("\r\n").length,2);
});
test("Income CSV safely escapes formula-prefixed text and excludes other years",()=>{
 const csv=exportSyntheticEarningsCsv(items,2025,"2026-11-01T23:59:59-06:00");
 assert.match(csv,/S-25/);
 assert.doesNotMatch(csv,/S-26/);
 assert.ok(csv.includes("\"'=HYPERLINK"));
 assert.match(csv,/https:\/\/example\.test/);
});
test("Income CSV is integrated as downloadable demo-only yearly earnings",()=>{
 const src=fs.readFileSync("app/demo/inspector-income/page.tsx","utf8");
 assert.match(src,/exportSyntheticEarningsCsv\(data,year,DATA_THROUGH\)/);
 assert.match(src,/download=\{"inspectsource-synthetic-earnings-"\+year\+"\.csv"\}/);
 assert.match(src,/Download selected-year synthetic earnings CSV/);
 assert.doesNotMatch(src,/supabaseBrowser|axios|fetch\(/);
});
