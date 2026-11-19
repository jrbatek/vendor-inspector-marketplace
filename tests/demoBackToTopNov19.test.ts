import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const layout = readFileSync("app/demo/layout.tsx", "utf8");
const component = readFileSync("components/DemoBackToTop.tsx", "utf8");
const rootLayout = readFileSync("app/layout.tsx", "utf8");
const smoke = readFileSync("scripts/smoke-demo-control-visibility.mjs", "utf8");

test("one shared demo segment mounts Back to top across nested demo routes but not live workspaces", () => {
  assert.match(layout, /import DemoBackToTop from "@\/components\/DemoBackToTop"/);
  assert.match(layout, /<DemoBackToTop\s*\/>/);
  assert.doesNotMatch(rootLayout, /DemoBackToTop/);
  const email = readFileSync("app/email-requirements/page.tsx", "utf8");
  assert.match(email, /pathname === "\/email-requirements" && demo && <DemoBackToTop \/>/);
  assert.ok(smoke.includes('"/email-requirements?demo=1"'));
  assert.ok(smoke.includes('"/email-requirements"'));
  assert.match(smoke, /Live email requirements route must not mount Demo Back to top/);
  assert.match(component, /const SCROLL_THRESHOLD = 500/);
  assert.match(component, /window\.scrollY >= SCROLL_THRESHOLD/);
  assert.match(component, /addEventListener\("scroll", sync, \{ passive: true \}\)/);
  assert.match(component, /removeEventListener\("scroll", sync\)/);
  assert.match(component, /aria-label="Back to top"/);
  assert.match(component, /type="button"/);
  assert.match(component, /prefers-reduced-motion: reduce/);
  assert.match(component, /reducedMotion \? "auto" : "smooth"/);
  assert.match(component, /:focus-visible/);
  assert.match(component, /safe-area-inset-bottom/);
  assert.match(component, /aria-hidden=\{!visible\}/);
  assert.match(component, /tabIndex=\{visible \? 0 : -1\}/);
  assert.match(component, /visibility: hidden/);
  assert.match(component, /returningToTop\.current = true/);
  assert.match(component, /setVisible\(atThreshold \|\| returningToTop\.current\)/);
  assert.match(component, /getElementById\("main-content"\)\?\.focus\(\{ preventScroll: true \}\)/);
  assert.match(component, /behavior: "instant"/);
});

test("real Chromium checks threshold, keyboard activation, reduced motion, responsive placement and every demo route", () => {
  const demoRoot = "app/demo";
  const routes = readdirSync(demoRoot, { withFileTypes: true })
    .filter(entry => entry.isDirectory() && existsSync(join(demoRoot, entry.name, "page.tsx")))
    .map(entry => "/demo/" + entry.name);
  for (const route of routes) assert.ok(smoke.includes('"' + route + '"'), "Missing demo route from browser audit: " + route);
  assert.match(smoke, /for \(const width of \[1440, 390\]\)/);
  assert.match(smoke, /route\.startsWith\("\/demo\/"\)/);
  assert.match(smoke, /Demo Back to top appeared before threshold/);
  assert.match(smoke, /Demo Back to top missing after scroll/);
  assert.match(smoke, /Demo Back to top failed keyboard activation/);
  assert.match(smoke, /page\.emulateMedia\(\{ reducedMotion: "reduce" \}\)/);
});
