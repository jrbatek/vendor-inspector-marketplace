import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const smoke = readFileSync("scripts/smoke-demo-control-visibility.mjs", "utf8");

test("public demos exercise rendered Client, Inspector and Agency global menus on desktop and mobile", () => {
  assert.match(smoke, /for \(const width of \[1440, 390\]\)/);
  assert.match(smoke, /\["\/demo\/client", "\/demo\/inspector", "\/demo\/agency"\]\.includes\(route\)/);
  assert.match(smoke, /for \(const audience of \["Clients", "Inspectors", "Agencies"\]\)/);
  assert.match(smoke, /primaryNav\.getByRole\("button"/);
  assert.match(smoke, /menu\.locator\("a\[href\]"\)\.evaluateAll/);
  assert.match(smoke, /item\.path\.startsWith\("\/demo\/"\)/);
  assert.match(smoke, /menu escaped the synthetic experience/);
  assert.match(smoke, /page\.keyboard\.press\("Escape"\)/);
  assert.match(smoke, /const result = await page\.evaluate/);
});

test("audience menu browser audit does not mistake the explicit global Login link for a demo escape", () => {
  assert.match(smoke, /persistent site-header Login control is intentionally outside these menus/);
  assert.match(smoke, /header nav\[aria-label="Main navigation"\]/);
});
