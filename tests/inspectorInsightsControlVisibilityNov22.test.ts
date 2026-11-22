import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const src = fs.readFileSync("app/demo/inspector-selection-outcomes/page.tsx", "utf8");

test("peer insights controls are touch sized and readable across selected, hovered, disabled and keyboard states", () => {
  assert.match(src, /\.filters select\{min-height:44px;width:100%;padding:10px 12px/);
  assert.match(src, /\.filters select:hover\{background:#f8fafc;color:#0f172a/);
  assert.match(src, /\.filters select:disabled\{background:#e2e8f0;color:#334155/);
  assert.match(src, /\.filters button\{background:#115e59;color:#fff;border:1px solid #115e59;min-height:44px/);
  assert.match(src, /\.filters button:hover\{background:#134e4a;color:#fff/);
  assert.match(src, /\.filters button:disabled\{background:#e2e8f0;color:#334155/);
  assert.match(src, /button:focus-visible,a:focus-visible,select:focus-visible\{outline:3px solid #2563eb/);
  assert.match(src, /a\{display:inline-flex;align-items:center;min-height:44px/);
});
test("synthetic peer comparisons retain minimum cohort and individual outcome privacy protection", () => {
  assert.match(src, /MIN_PEER_COHORT/);
  assert.match(src, /summary\.available/);
  assert.match(src, /No peer names, profiles, individual rates, individual outcomes/);
  assert.match(src, /No individual selection decisions or competing inspectors are shown/);
  assert.doesNotMatch(src, /createClient\(|supabaseBrowser|XMLHttpRequest/);
});
