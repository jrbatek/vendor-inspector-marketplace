import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const page = fs.readFileSync("app/demo/client-analytics/page.tsx", "utf8");

test("nested chart and filter controls use page-scoped global CSS, not unreachable parent styled-jsx selectors", () => {
  assert.match(page, /clientAnalyticsPage shell embedded/);
  assert.match(page, /clientAnalyticsPage shell/);
  assert.match(page, /!embedded&&<ClientWorkspaceSidebar demo\/>/);
  assert.match(page, /\.shell\.embedded\{display:block/);
  assert.match(page, /<style jsx global>/);
  for (const cls of [".filter select", ".barRow.clickable:focus-visible", ".barRow.clickable[aria-pressed=true]", ".kpi", ".grid .panel", ".track", ".fill"]) {
    assert.ok(page.includes(".clientAnalyticsPage " + cls), "missing page-scoped nested style: " + cls);
  }
});

test("analytics bar filters are keyboard-focusable and clearly distinguish selected values", () => {
  assert.match(page, /aria-pressed=\{selected===r\.name\}/);
  assert.match(page, /\.barRow\.clickable:hover\{background:#f0fdfa/);
  assert.match(page, /\.barRow\.clickable:focus-visible\{outline:3px solid #0d9488/);
  assert.match(page, /\.barRow\.clickable\[aria-pressed=true\]\{background:#ccfbf1;border-left:4px solid #115e59/);
  for (const key of ["sourceType","agency","country","projectType","commodity","ncrType"]) {
    assert.ok(page.includes('selected={' + key + '}'), "missing selected filter: " + key);
  }
});

test("remaining native analytics selectors retain legible foreground and background", () => {
  assert.match(page, /\.filter select\{[^}]*background:#fff;color:#0f172a/);
  assert.match(page, /\.filter select:focus-visible\{outline:3px solid #0d9488/);
  assert.doesNotMatch(page, /<Filter label="Source Type"/);
  assert.match(page, /<strong>Source Type<\/strong>/);
});

test("empty completed cohorts are not mislabeled zero percent on-time", () => {
  assert.match(page, /completed\.length \? .* : "N\/A"/);
  assert.doesNotMatch(page, /completed\.length\?onTime\/completed\.length\*100:0/);
});

test("analytics discloses the 30-row preview limit while keeping full CSV export", () => {
  assert.match(page, /Math\.min\(filtered\.length, 30\)/);
  assert.match(page, /Showing \{Math\.min/);
  assert.match(page, /Download the CSV for all matching records/);
  assert.match(page, /No inspections match these filters/);
  assert.match(page, /filtered\.slice\(0,30\)/);
  assert.match(page, /const download=\(\)=>/);
});

test("selected analytics bar can be deselected without resetting unrelated slicers", () => {
  assert.match(page, /onClick=\{\(\)=>onSelect\(selected===r\.name\?ALL:r\.name\)\}/);
});


test("Analytics Source Type segmented buttons and clickable chart rows keep readable 44px touch targets", () => {
  assert.match(page, /\.quickSources button\{min-height:44px;background:#fff;color:#115e59/);
  assert.match(page, /\.clientAnalyticsPage \.barRow\.clickable\{cursor:pointer;border-radius:8px;min-height:44px\}/);
  assert.match(page, /\.quickSources button\[aria-pressed=true\]\{color:#fff;background:#0f766e\}/);
  assert.match(page, /\.clientAnalyticsPage \.barRow\.clickable:focus-visible\{outline:3px solid #0d9488/);
  const smoke = fs.readFileSync("scripts/smoke-client-analytics.mjs", "utf8");
  assert.match(smoke, /Analytics Source Type\/chart controls below 44px minimum/);
  assert.match(smoke, /Mobile embedded Analytics source\/chart touch targets below 44px/);
});
