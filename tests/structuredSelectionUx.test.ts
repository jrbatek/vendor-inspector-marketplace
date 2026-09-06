import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const source = fs.readFileSync(path.join(process.cwd(), "components/InspectorFilterPage.tsx"), "utf8");

test("structured selection uses the requested inspection-criteria heading", () => {
  assert.match(source, /Select your inspection criteria\./);
  assert.doesNotMatch(source, /Build your inspector criteria/);
});

test("structured selection clearly marks demo data with a subtle treatment", () => {
  assert.match(source, /Demo Mode · Synthetic data/);
  assert.match(source, /\.demoBanner\{[^}]*background:#f0fdfa/);
  assert.match(source, /\.demoBanner\{[^}]*border:1px solid #99f6e4/);
});

test("structured selection requires location and start date", () => {
  assert.match(source, /Start date \*/);
  assert.match(source, /Location \*/);
  assert.match(source, /Location and start date are required before finding inspectors\./);
  assert.equal((source.match(/aria-required="true"/g) || []).length >= 2, true);
});

test("structured selection uses clear find-inspectors language", () => {
  assert.match(source, /"Find Inspectors"/);
  assert.doesNotMatch(source, /"Identify inspectors"/);
});

test("structured selection demo includes an editable day-rate value", () => {
  assert.match(source, /rate:"950"/);
  assert.match(source, /setRate\(DEMO\.rate\)/);
  assert.match(source, /placeholder="Enter maximum"/);
});

test("structured selection layout is intentionally wider and reset remains readable", () => {
  assert.match(source, /max-width:1680px/);
  assert.match(source, /grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);
  assert.match(source, /\.reset\{[^}]*color:#0f172a/);
});
