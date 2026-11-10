import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import {
  INSPECTOR_DEMO_WORK_HISTORY as rows,
  EMPTY_WORK_HISTORY_FILTERS as empty,
  filterInspectorWorkHistory,
  inspectorWorkReportHref,
} from "../lib/inspectorWorkHistoryDemo";

const page = fs.readFileSync("app/demo/inspector-work-history/page.tsx", "utf8");
const hub = fs.readFileSync("app/demo/inspector/page.tsx", "utf8");
const legacy = fs.readFileSync("app/demo/inspector-reports/page.tsx", "utf8");

test("Work History contains deterministic synthetic completed assignments and submitted reports", () => {
  assert.equal(rows.length, 10);
  assert.equal(new Set(rows.map(row => row.id)).size, 10);
  assert.equal(new Set(rows.map(row => row.reportId)).size, 10);
  for (const row of rows) {
    for (const field of ["client","project","vendor","location","industry","commodity","reportId","finding"] as const) assert.ok(row[field], field);
    assert.ok(row.start <= row.completed, row.id);
    assert.ok(row.completed <= row.submitted, row.id);
  }
  assert.ok(rows.some(row => row.ncr));
  assert.ok(rows.some(row => !row.ncr));
});

test("Work History filters by client, industry, commodity, status and inclusive completion dates", () => {
  const first = rows[0];
  for (const key of ["client","industry","commodity","status"] as const) {
    assert.ok(filterInspectorWorkHistory(rows,{...empty,[key]:first[key]}).includes(first),key);
  }
  assert.deepEqual(filterInspectorWorkHistory(rows,{...empty,client:first.client,commodity:first.commodity,from:first.completed,to:first.completed}),[first]);
  assert.equal(filterInspectorWorkHistory(rows,{...empty,from:"2026-09-20"}).length,0);
  assert.equal(filterInspectorWorkHistory(rows,{...empty,from:"2026-09-20",to:"2026-09-01"}).length,0);
  assert.equal(filterInspectorWorkHistory(rows,empty).length,rows.length);
});

test("NCR findings filter works across both Work History views and composes with other filters", () => {
  const withNcr = rows.filter(row => row.ncr);
  const withoutNcr = rows.filter(row => !row.ncr);
  assert.deepEqual(filterInspectorWorkHistory(rows, {...empty, ncr:"with"}), withNcr);
  assert.deepEqual(filterInspectorWorkHistory(rows, {...empty, ncr:"without"}), withoutNcr);
  assert.deepEqual(filterInspectorWorkHistory(rows, {...empty, ncr:""}), rows);
  assert.equal(filterInspectorWorkHistory(rows, {...empty, ncr:"with", client:"NONEXISTENT"}).length, 0);
  assert.equal(withNcr.length + withoutNcr.length, rows.length);
  assert.match(page, /NCR findings/);
  assert.match(page, /value="with">NCR raised/);
  assert.match(page, /value="without">No NCR raised/);
  assert.match(page, /choose\("ncr",event\.target\.value\)/);
});

test("submitted reports offer functional, correctly encoded and visibly synthetic PDFs", () => {
  for (const row of rows) {
    const pdf = new URL(inspectorWorkReportHref(row), "https://example.test");
    const download = new URL(inspectorWorkReportHref(row,true), "https://example.test");
    assert.equal(pdf.pathname,"/api/demo/report");
    assert.equal(pdf.searchParams.get("project"),row.project);
    assert.equal(pdf.searchParams.get("supplier"),row.vendor);
    assert.equal(pdf.searchParams.get("ncr"),row.ncr?"1":"0");
    assert.equal(download.searchParams.get("download"),"1");
  }
  assert.match(page,/View sample PDF/);
  assert.match(page,/Download sample PDF/);
  assert.match(page,/synthetic demonstration/);
  assert.doesNotMatch(page,/supabaseBrowser|supabase\.from\(|supabase\.insert\(|supabase\.update\(|supabase\.delete\(/);
});

test("InspectorHub consolidates the reports navigation into Work History and maintains deep links", () => {
  assert.match(hub,/\["work","Work History"\]/);
  assert.doesNotMatch(hub,/\["reports","Inspection Reports"\]/);
  assert.match(hub,/href="\/demo\/inspector-work-history"/);
  assert.match(page,/Assignments Performed/);
  assert.match(page,/Reports Submitted/);
  assert.match(page,/role="group" aria-label="Work History views"/);
  assert.match(page,/aria-pressed=\{view === "assignments"\}/);
  assert.match(page,/aria-pressed=\{view === "reports"\}/);
  assert.match(page,/Open assignment/);
  assert.match(page,/Reset filters/);
  assert.match(page,/button:focus-visible/);
  assert.match(legacy,/redirect\("\/demo\/inspector-work-history"\)/);
});


test("Work History filters expose invalid date ranges to keyboard and screen-reader users", () => {
  assert.match(page,/const invalidDates = Boolean\(filters\.from && filters\.to && filters\.from > filters\.to\)/);
  assert.equal((page.match(/aria-invalid=\{invalidDates\}/g) || []).length, 2);
  assert.equal((page.match(/aria-describedby="work-history-date-help"/g) || []).length, 2);
  assert.match(page,/id="work-history-date-help"/);
  assert.match(page,/invalidDates && <div className="invalidDateNotice" role="alert">/);
  assert.match(page,/Clear invalid date range/);
  assert.match(page,/setFilters\(current => \(\{ \.\.\.current, from: "", to: "" \}\)\)/);
  assert.match(page,/invalidDates \? "Invalid completion date range" : "No matching work history"/);
  assert.doesNotMatch(page,/role="tablist"|aria-selected=\{view ===/);
});
