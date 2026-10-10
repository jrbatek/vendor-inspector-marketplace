import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const source = fs.readFileSync(path.join(process.cwd(), "app/demo/inspector-selection-outcomes/page.tsx"), "utf8");

test("selection outcomes expose numerical funnel counts and conversion", () => {
  for (const label of ["Selection Outcomes", "Presented", "Shortlisted", "Selected", "Shortlist → selection", "Recent conversion"]) assert.match(source, new RegExp(label));
  assert.match(source, /current\.shortlisted \/ current\.presented/);
  assert.match(source, /current\.selected \/ current\.presented/);
  assert.match(source, /current\.selected \/ current\.shortlisted/);
});

test("selection differentiators are evidence-supported without guarantees", () => {
  assert.match(source, /Evidence-supported differentiators/);
  assert.match(source, /not guarantees, eligibility claims, or rankings against named inspectors/);
  assert.match(source, /Required qualifications documented/);
  assert.match(source, /Local or low-travel availability/);
  assert.match(source, /Recent relevant work evidence/);
});

test("selection outcomes protect competing inspector privacy", () => {
  assert.match(source, /Competing inspector identities, profiles, rates, rankings, and individual outcomes are never exposed/);
  assert.match(source, /Comparisons are aggregate and evidence-supported only/);
});

test("selection outcomes remain synthetic and production-isolated", () => {
  assert.match(source, /Demo Mode · Synthetic data/);
  assert.match(source, /deterministic examples/);
  assert.match(source, /authenticated inspector&apos;s own selection history/);
  assert.doesNotMatch(source, /supabaseBrowser|\.from\(|\.insert\(|\.update\(|\.delete\(|fetch\(/);
});
