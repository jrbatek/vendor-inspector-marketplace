import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const page = fs.readFileSync(path.join(process.cwd(), "app/demo/client-analytics/page.tsx"), "utf8");
const nav = fs.readFileSync(path.join(process.cwd(), "components/Nav.tsx"), "utf8");

test("client analytics demo exposes requested synthetic KPIs and cross-filter dimensions", () => {
  assert.match(page, /Inspection spend/);
  assert.match(page, /Inspection visits/);
  assert.match(page, /On-time rate/);
  assert.match(page, /Projects with NCR/);
  assert.match(page, /Region/);
  assert.match(page, /Commodity/);
  assert.match(page, /Project type/);
  assert.match(page, /Timing/);
  assert.match(page, /Non-conformance/);
  assert.match(page, /NCR type/);
});

test("client analytics demo includes trend, geography, portfolio, quality and detail views", () => {
  assert.match(page, /Monthly inspection spend/);
  assert.match(page, /Projects by region/);
  assert.match(page, /Project type mix/);
  assert.match(page, /NCR type mix/);
  assert.match(page, /Cross-filtered inspection detail/);
  assert.match(page, /Select a region marker to cross-filter the full dashboard/);
});

test("client analytics demo is deterministic and isolated from production", () => {
  assert.match(page, /Client Demo · Synthetic data/);
  assert.match(page, /never reads from or writes to a production tenant/);
  assert.match(page, /does not create API credentials/);
  assert.doesNotMatch(page, /supabaseBrowser/);
  assert.doesNotMatch(page, /\.from\(/);
});

test("client navigation exposes analytics demo", () => {
  assert.match(nav, /\["Client Analytics Demo", "\/demo\/client-analytics"\]/);
});
