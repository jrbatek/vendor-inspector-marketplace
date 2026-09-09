import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const page = fs.readFileSync(path.join(process.cwd(), "app/demo/client-analytics/page.tsx"), "utf8");
const data = fs.readFileSync(path.join(process.cwd(), "lib/clientDemoInspections.ts"), "utf8");
const nav = fs.readFileSync(path.join(process.cwd(), "components/Nav.tsx"), "utf8");

test("client analytics demo exposes the complete requested cross-filter contract", () => {
  for (const label of ["Project","Project Type","Country","Commodity","Timing","Non-conformance","NCR Type"]) {
    assert.match(page, new RegExp(`Filter label=\\"${label}\\"`));
  }
  assert.match(page, /Cross-filter spend, timing, geography, project type, commodity and non-conformance performance/);
});

test("client analytics demo restores meaningful spend, timing and NCR KPIs", () => {
  assert.match(page, /Inspection spend/);
  assert.match(page, /Inspections in view/);
  assert.match(page, /On-time performance/);
  assert.match(page, /Projects with NCRs/);
  assert.match(data, /spendUsd:number/);
  assert.match(data, /timing:"On time"\|"Late"\|"Upcoming"/);
});

test("client analytics demo includes trends, geography, project type, commodity and NCR analysis", () => {
  assert.match(page, /Monthly spend trend/);
  assert.match(page, /Geography \/ map view/);
  assert.match(page, /Project type/);
  assert.match(page, /Commodity/);
  assert.match(page, /NCR type/);
  assert.match(page, /Cross-filtered inspection records/);
  assert.match(data, /Material traceability/);
  assert.match(data, /Welding/);
  assert.match(data, /Documentation/);
  assert.match(data, /Dimensional/);
  assert.match(data, /Coating/);
});

test("client analytics demo is downloadable, integration-aware and isolated from production", () => {
  assert.match(page, /Client Demo · Synthetic data/);
  assert.match(page, /Download data/);
  assert.match(page, /inspectsource-client-demo-inspections\.csv/);
  assert.match(page, /API, Excel & Power BI connectivity/);
  assert.match(page, /\/demo\/client-data/);
  assert.doesNotMatch(page, /supabaseBrowser|supabase\.from\(|\.insert\(|\.update\(|\.delete\(/);
});

test("client navigation exposes analytics demo", () => {
  assert.match(nav, /\["Client Analytics Demo", "\/demo\/client-analytics"\]/);
});
