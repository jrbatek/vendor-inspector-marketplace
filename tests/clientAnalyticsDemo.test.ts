import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const page = fs.readFileSync(path.join(process.cwd(), "app/demo/client-analytics/page.tsx"), "utf8");
const nav = fs.readFileSync(path.join(process.cwd(), "components/Nav.tsx"), "utf8");

test("client analytics demo exposes current synthetic KPIs and cross-filter dimensions", () => {
  assert.match(page, /Inspections in view/);
  assert.match(page, /Completed/);
  assert.match(page, /Countries in view/);
  assert.match(page, /Completed NCR rate/);
  assert.match(page, /Filter label="Project"/);
  assert.match(page, /Filter label="Country"/);
  assert.match(page, /Filter label="Commodity"/);
  assert.match(page, /Filter label="NCR"/);
});

test("client analytics demo includes drillable portfolio, geography, commodity, quality and detail views", () => {
  assert.match(page, /Inspections by project/);
  assert.match(page, /Top countries in current view/);
  assert.match(page, /Inspections by commodity/);
  assert.match(page, /Non-conformance performance/);
  assert.match(page, /Filtered records/);
  assert.match(page, /Expanded analytics/);
  assert.match(page, /Drill in →/);
});

test("client analytics demo is deterministic, downloadable and isolated from production", () => {
  assert.match(page, /Client Demo · Synthetic data/);
  assert.match(page, /DEMO_INSPECTIONS/);
  assert.match(page, /Download data/);
  assert.match(page, /inspectsource-client-demo-inspections\.csv/);
  assert.doesNotMatch(page, /supabaseBrowser|supabase\.from\(|\.insert\(|\.update\(|\.delete\(/);
});

test("client navigation exposes analytics demo", () => {
  assert.match(nav, /\["Client Analytics Demo", "\/demo\/client-analytics"\]/);
});
