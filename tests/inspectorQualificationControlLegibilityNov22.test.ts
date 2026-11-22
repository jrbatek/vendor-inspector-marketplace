import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const qualificationPage = readFileSync("app/demo/inspector-documents/page.tsx", "utf8");
const browserSmoke = readFileSync("scripts/smoke-inspector-demo.mjs", "utf8");

test("synthetic Qualifications controls have visible and tappable styles", () => {
  assert.match(qualificationPage, /button\{min-height:44px;/);
  assert.match(qualificationPage, /input,select\{min-height:44px;width:100%;max-width:100%;box-sizing:border-box/);
  assert.match(qualificationPage, /input:focus-visible,select:focus-visible,.recommendations a:focus-visible/);
  assert.match(qualificationPage, /button:disabled\{background:#e2e8f0;color:#475569;border-color:#94a3b8;opacity:1/);
  assert.match(qualificationPage, /.recommendations a,.localPreview a\{color:#115e59;[^\n]*min-height:44px/);
});

test("InspectorHub Chromium checks qualification controls, without real credentials or uploads", () => {
  assert.match(browserSmoke, /undersizedQualificationControls/);
  assert.match(browserSmoke, /node\.getBoundingClientRect\(\)\.height<44/);
  assert.match(qualificationPage, /Use sample files only/);
  assert.match(qualificationPage, /nothing is sent to a server/);
});
