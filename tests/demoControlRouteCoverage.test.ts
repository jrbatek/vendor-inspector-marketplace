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

test("browser audit rejects public demo-to-live workspace exits and login placeholders", () => {
  assert.ok(script.includes('route.startsWith("/demo/")'));
  assert.ok(script.includes('document.querySelectorAll("main a[href], main form[action]")'));
  assert.ok(script.includes("protectedDemoRoutes.some"));
  for (const route of ["login", "register", "client-dashboard", "client-workspace", "inspector-dashboard", "inspectorhub", "agency-dashboard", "agency-workspace"])
    assert.ok(script.includes('"/' + route + '"'), "Missing protected live route: " + route);
  assert.ok(script.includes("contains demo-to-live workspace exits"));
  assert.ok(script.includes("rendered an authenticated workspace placeholder"));
  assert.ok(script.includes("Log in to view the client workspace"));
});
