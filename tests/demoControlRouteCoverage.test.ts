import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const script = fs.readFileSync("scripts/smoke-demo-control-visibility.mjs", "utf8");
test("control visibility browser audit covers every public demo route on desktop and mobile", () => {
  assert.match(script, /for \(const width of \[1440, 390\]\)/);
  assert.match(script, /for \(const route of routes\)/);
  assert.match(script, /page\.on\("pageerror"/);
  assert.match(script, /contrast < \(disabled \? 2 : 3\)/);
  const demoRoot = "app/demo";
  const routes = fs.readdirSync(demoRoot, { withFileTypes: true })
    .filter(entry => entry.isDirectory() && fs.existsSync(path.join(demoRoot, entry.name, "page.tsx")))
    .map(entry => "/demo/" + entry.name);
  assert.ok(routes.length >= 18, "Should include every published Client, Inspector and Agency demo route");
  for (const route of routes) {
    assert.ok(script.includes('"' + route + '"'), route + " lacks browser contrast coverage");
  }
});
