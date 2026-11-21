import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const page = readFileSync("app/demo/client-analytics/page.tsx", "utf8");
const smoke = readFileSync("scripts/smoke-client-analytics.mjs", "utf8");

test("P0-B: native Analytics slicers and action buttons retain legible 44px targets", () => {
  assert.ok(page.includes(".clientAnalyticsPage .filter select{min-height:44px;min-width:0;"));
  assert.ok(page.includes(".actions button{min-height:44px;"));
  assert.ok(page.includes(".activeFilterBar button{min-height:44px;"));
  assert.match(page, /\.clientAnalyticsPage \.filter select\{[^}]*background:#fff;color:#0f172a/);
  assert.match(page, /\.filter select:disabled\{background:#f8fafc;color:#334155;opacity:1/);
  assert.match(page, /\.actions button:focus-visible\{outline:3px solid #0d9488/);
});
test("P0-B: browser verifies native slicers/actions on standalone and embedded desktop/mobile", () => {
  assert.ok(smoke.includes("async function assertAccessibleControls(panel, context)"));
  assert.ok(smoke.includes(".filters select, .actions button, .activeFilterBar button"));
  for (const label of ["Standalone", "Embedded desktop", "Embedded mobile"]) {
    assert.ok(smoke.includes(', "' + label + '");'), label);
  }
});
