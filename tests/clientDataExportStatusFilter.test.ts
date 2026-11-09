import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const page=readFileSync("app/demo/client-data/page.tsx","utf8");
const smoke=readFileSync("scripts/smoke-demo-control-visibility.mjs","utf8");
test("Client Data Demo filters only fictional export preview and CSV/JSON cohorts",()=>{
 assert.match(page,/const \[exportStatus,setExportStatus\]=useState\("All statuses"\)/);
 assert.match(page,/filteredRows=useMemo\(\(\)=>exportStatus==="All statuses"\?rows:rows.filter\(row=>row.status===exportStatus\)/);
 assert.match(page,/buildDemoCsv\(headers,filteredRows.map/);
 assert.match(page,/buildDemoJson\(filteredRows\)/);
 assert.match(page,/filteredRows.map\(row=><tr/);
 assert.match(page,/Reset export filter/);
 assert.match(page,/fictional records selected for CSV and JSON/);
 assert.doesNotMatch(page,/\.insert\(|\.update\(|supabaseBrowser/);
});
test("Client Data status filter is accessible, legible and Chromium validates downloaded JSON",()=>{
 assert.match(page,/aria-label="Export status"/);
 assert.match(page,/\.exportFilterTools select,.exportFilterTools button\{[^}]*background:#fff;color:#0f172a/);
 assert.match(page,/\.exportFilterTools select:focus-visible/);
 assert.match(page,/\.exportFilterTools button:disabled\{background:#f1f5f9;color:#475569/);
 assert.match(smoke,/route === "\/demo\/client-data"/);
 assert.match(smoke,/page.waitForEvent\("download"\)/);
 assert.match(smoke,/body.count !== 1/);
});
