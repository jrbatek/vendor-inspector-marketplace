import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const source = fs.readFileSync("app/demo/agency-affiliations/page.tsx", "utf8");

test("Agency affiliation claim and status filters remain legible, touch-sized and keyboard usable", () => {
  assert.match(source, /\.head button,\.filters button\{min-height:44px;border:1px solid #1d4ed8/);
  assert.match(source, /\.filters button\{background:#f1f5f9;color:#0f172a;border-color:#cbd5e1/);
  assert.match(source, /\.filters button\[aria-pressed=true\]\{background:#1d4ed8;color:#fff/);
  assert.match(source, /\.filters button\[aria-pressed=true\]:hover\{background:#1e40af;color:#fff/);
  assert.match(source, /\.head button\[aria-expanded=true\]\{background:#1e3a8a;color:#fff/);
  assert.match(source, /\.head button:disabled,\.filters button:disabled,\.filters button\[aria-pressed=true\]:disabled\{background:#e2e8f0;color:#334155/);
  assert.match(source, /\.head button:focus-visible,\.filters button:focus-visible\{outline:3px solid #2563eb/);
  assert.match(source, /aria-expanded=\{claimPreview\}/);
  assert.match(source, /aria-pressed=\{filter===option\}/);
});

test("Agency affiliations return link stays actionable and accessible even on narrow viewports", () => {
  assert.match(source, /header a\{display:inline-flex;align-items:center;min-height:44px/);
  assert.match(source, /header a:hover\{background:#dbeafe;color:#1e40af\}/);
  assert.match(source, /header a:focus-visible\{outline:3px solid #2563eb/);
  assert.match(source, /href="\/demo\/agency"/);
});

test("control states do not alter demo-only affiliation boundaries", () => {
  assert.match(source, /synthetic affiliation records only/);
  assert.match(source, /No live inspector is contacted or changed/);
  assert.doesNotMatch(source, /supabaseBrowser|process\.env|fetch\(|XMLHttpRequest|FormData/);
});
