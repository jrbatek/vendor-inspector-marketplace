import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const smoke = readFileSync("scripts/smoke-demo-control-visibility.mjs", "utf8");

test("global synthetic demo legibility audit includes native multiline textareas", () => {
  assert.match(smoke, /querySelectorAll\("button, a\[href\], select, textarea, input:not\(\[type=hidden\]\), summary, \[role=button\]"\)/);
  assert.match(smoke, /getComputedStyle\(el\)/);
  assert.match(smoke, /contrast < \(disabled \? 2 : 3\)/);
  assert.match(smoke, /for \(const width of \[1440, 390\]\)/);
  assert.ok(smoke.includes('"/demo/client"'));
  assert.ok(smoke.includes('"/demo/inspector"'));
  assert.ok(smoke.includes('"/demo/agency"'));
});
