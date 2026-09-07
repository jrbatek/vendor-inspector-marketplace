import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const page = fs.readFileSync(path.join(process.cwd(), "app/demo/client-data/page.tsx"), "utf8");
const nav = fs.readFileSync(path.join(process.cwd(), "components/Nav.tsx"), "utf8");

test("client demo exposes downloadable synthetic inspection data", () => {
  assert.match(page, /Demo Mode/);
  assert.match(page, /Synthetic inspection data only/);
  assert.match(page, /Download synthetic client data \(\.CSV\)/);
  assert.match(page, /inspectsource-client-demo-data\.csv/);
  assert.match(page, /new Blob\(\[csv\]/);
});

test("client demo shows API, Excel, Power BI and ERP connectivity concepts", () => {
  assert.match(page, /Excel & CSV/);
  assert.match(page, /InspectSource API/);
  assert.match(page, /Power BI/);
  assert.match(page, /ERP & procurement/);
  assert.match(page, /GET \/api\/v1\/client\/inspections/);
});

test("connectivity demo remains isolated from live credentials and production writes", () => {
  assert.match(page, /does not issue API credentials/);
  assert.match(page, /does not.*expose production data/);
  assert.doesNotMatch(page, /supabaseBrowser/);
  assert.doesNotMatch(page, /\.from\(/);
});

test("client navigation exposes the data and integrations demo", () => {
  assert.match(nav, /\["Data & Integrations Demo", "\/demo\/client-data"\]/);
});
