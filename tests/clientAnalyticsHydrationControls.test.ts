import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import test from "node:test";

test("analytics demo selectors and chart filters remain disabled until hydration", () => {
  const src = readFileSync("app/demo/client-analytics/page.tsx", "utf8");
  assert.match(src, /useEffect\(\(\)=>setHydrated\(true\),\[\]\)/);
  assert.match(src, /aria-busy=\{!hydrated\}/);
  assert.equal((src.match(/<Filter label=/g) || []).length, 9);
  assert.equal((src.match(/disabled=\{!hydrated\}/g) || []).length, 9);
  assert.equal((src.match(/enabled=\{hydrated\}/g) || []).length, 7);
  assert.match(src, /disabled=\{disabled\}/);
  assert.match(src, /disabled=\{!enabled\}/);
  assert.match(src, /\.clientAnalyticsPage \.filter select:disabled\{[^}]*opacity:1/);
});
