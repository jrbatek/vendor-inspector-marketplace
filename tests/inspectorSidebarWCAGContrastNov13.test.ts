import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

// This source contract protects the real browser check, which computes CSS
// instead of trusting a class name or one static style declaration.
const smoke = readFileSync("scripts/smoke-demo-control-visibility.mjs", "utf8");
test("all eight InspectorHub sidebar text controls require WCAG AA 4.5:1 contrast in real Chromium", () => {
  assert.match(smoke, /InspectorHub must retain eight accessible sidebar text links/);
  assert.match(smoke, /element\.closest\("aside\.side"\)/);
  assert.match(smoke, /const contrast = \(Math\.max\(textLuminance, backgroundLuminance\)/);
  assert.match(smoke, /style\.contrast < 4\.5/);
  for (const state of [
    "Default InspectorHub sidebar link", "Active InspectorHub sidebar link",
    "Hovered InspectorHub sidebar link", "Focused InspectorHub sidebar link"
  ]) assert.ok(smoke.includes(state), state);
  assert.match(smoke, /style\.radius !== "0px"/);
  assert.match(smoke, /style\.shadow !== "none"/);
});
