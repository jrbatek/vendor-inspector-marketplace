import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const page = fs.readFileSync("app/demo/client-analytics/page.tsx", "utf8");

test("nested chart and filter controls use page-scoped global CSS, not unreachable parent styled-jsx selectors", () => {
  assert.match(page, /className="clientAnalyticsPage shell"/);
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

test("analytics native selectors retain legible foreground and background", () => {
  assert.match(page, /\.filter select\{[^}]*background:#fff;color:#0f172a/);
  assert.match(page, /\.filter select:focus-visible\{outline:3px solid #0d9488/);
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
