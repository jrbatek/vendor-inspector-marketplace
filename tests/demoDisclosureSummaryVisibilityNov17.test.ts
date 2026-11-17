import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("global desktop/mobile demo control audit includes native disclosure summaries", () => {
  const source = readFileSync("scripts/smoke-demo-control-visibility.mjs", "utf8");
  assert.match(source, /document\.querySelectorAll\("button, a\[href\], select, textarea, input:not\(\[type=hidden\]\), summary, \[role=button\]"\)/);
  assert.match(source, /for \(const width of \[1440, 390\]\)/);
  assert.match(source, /if \(!name \|\| Number\(s\.opacity\) < 0\.25 \|\| contrast < \(disabled \? 2 : 3\)\)/);
  assert.match(source, /throw new Error\(width \+ "px " \+ route \+ " browser\/legibility regressions/);
});
