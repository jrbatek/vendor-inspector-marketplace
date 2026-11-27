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
  for (const route of routes) {
    if (route === "/demo/client-history") {
      const clientSmoke = readFileSync("scripts/smoke-client-inspections.mjs", "utf8");
      assert.match(clientSmoke, /\["\/demo\/client-history","analytics"\]/);
      assert.match(clientSmoke, /\["\/demo\/client-history\?view=active","inspections-in-progress"\]/);
      assert.match(clientSmoke, /Legacy Client History redirect lost fictional inspections/);
    } else {
      assert.ok(smoke.includes('"' + route + '"'), "Missing demo route from browser audit: " + route);
    }
  }
  assert.match(smoke, /for \(const width of \[1440, 390\]\)/);
  assert.match(smoke, /route\.startsWith\("\/demo\/"\)/);
  assert.match(smoke, /Demo Back to top appeared before threshold/);
  assert.match(smoke, /Demo Back to top missing after scroll/);
  assert.match(smoke, /Demo Back to top failed keyboard activation/);
  assert.match(smoke, /page\.emulateMedia\(\{ reducedMotion: "reduce" \}\)/);
});

test("interrupted Back to top never snaps the reviewer up after a new wheel/touch/key action", () => {
  for (const eventName of ["wheel", "touchstart", "pointerdown", "keydown"]) {
    assert.ok(component.includes('addEventListener("' + eventName + '"'), eventName);
    assert.ok(component.includes('removeEventListener("' + eventName + '"'), eventName);
  }
  assert.match(component, /returningToTop\.current = false;\s*sync\(\)/);
  assert.match(component, /window\.clearTimeout\(settleTimer\.current\)/);
  assert.match(smoke, /Interrupted Demo Back to top unexpectedly snapped back to page start/);
  assert.match(smoke, /window\.dispatchEvent\(new Event\("wheel"\)\)/);
});

test("keyboard and history navigation cancel pending Back to top settle before it overrides another section", () => {
  assert.match(component, /"Tab", "Enter", "Escape"/);
  for (const eventName of ["hashchange", "popstate"]) {
    assert.ok(component.includes('addEventListener("' + eventName + '", cancelReturn)'), eventName + " missing subscription");
    assert.ok(component.includes('removeEventListener("' + eventName + '", cancelReturn)'), eventName + " missing cleanup");
  }
  assert.match(smoke, /for \(const kind of \["keyboard", "hashchange", "popstate"\]\)/);
  assert.match(smoke, /new KeyboardEvent\("keydown", \{ key: "Tab"/);
  assert.match(smoke, /Demo Back to top " \+ kind \+ " navigation unexpectedly snapped back/);
});

test("new user intent and cleanup also cancel the late two-frame correction", () => {
  assert.match(component, /const cancelReturn = \(\) => \{[\s\S]*?correction\.current\?\.cancel\(\);\s*if \(!returningToTop\.current\) return/);
  assert.match(component, /return \(\) => \{\s*window\.cancelAnimationFrame\(frame\);\s*correction\.current\?\.cancel\(\)/);
  assert.match(component, /const backToTop = \(\) => \{\s*correction\.current\?\.cancel\(\)/);
  assert.match(component, /correction\.current\?\.schedule\(\(\) => \{\s*window\.scrollTo\(\{ top: 0, left: 0, behavior: "instant" \}\)/);
});
