import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const source = fs.readFileSync("app/inspectorhub/page.tsx", "utf8");

test("unauthenticated InspectorHub synthetic demo opportunities are future-dated in November 2026", () => {
  for (const label of ["Nov 18–20, 2026", "Dec 2–4, 2026", "Dec 7–11, 2026"]) assert.ok(source.includes(label), label);
  for (const stale of ["Sep 21–Oct 2", "Oct 12–16", "Nov 3–14"]) assert.ok(!source.includes(stale), stale);
});
test("synthetic assignment cards and next-30-day availability agree", () => {
  assert.match(source, /dates:"Nov 9–11, 2026".*next:"Review ITP before Nov 9"/);
  assert.match(source, /dates:"Nov 16–18, 2026".*next:"Confirm vendor access"/);
  for (const range of ["Nov 9–11", "Nov 16–18", "Nov 23–25", "Dec 1–4"]) assert.ok(source.includes("<b>" + range + "</b>"), range);
  assert.match(source, /Tentative hold · Houston/);
});
test("InspectorHub demo fixtures remain synthetic and cannot be persisted without a live user", () => {
  assert.match(source, /setMode\("demo"\);setItems\(DEMO_WORK\)/);
  assert.match(source, /if\(mode!=="live"\)\{demoNotice\(\);return;\}/);
  assert.match(source, /source:"synthetic-demo"/);
  assert.match(source, /No payment execution, tax filing, bank credentials/);
});
