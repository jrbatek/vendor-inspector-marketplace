import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { demoNavigationHref, isDemoExperiencePath } from "../lib/demoExperience";

const nav = readFileSync("components/Nav.tsx", "utf8");
const banner = readFileSync("components/DemoModeBanner.tsx", "utf8");
const inspectorHub = readFileSync("app/inspectorhub/page.tsx", "utf8");

test("signed-in live InspectorHub is not mislabeled as a synthetic demo", () => {
  assert.equal(isDemoExperiencePath("/inspectorhub"), false);
  assert.equal(isDemoExperiencePath("/inspectorhub", "1"), false);
  assert.equal(isDemoExperiencePath("/inspectorhub/schedule"), false);
  assert.equal(isDemoExperiencePath("/demo/inspector"), true);
  assert.equal(isDemoExperiencePath("/demo-showcase"), true);
  assert.match(banner, /if \(!isDemoExperiencePath\(pathname, demoParam\)\) return null/);
  assert.match(inspectorHub, /setMode\("live"\)/);
  assert.match(inspectorHub, /from\("inspector_work_activities"\)/);
});

test("global audience navigation uses live destinations in live InspectorHub and synthetic destinations in demo", () => {
  // Only explicit demo routes opt into menu remapping; the live inspector workspace
  // must not quietly reroute authenticated users into the demo.
  assert.match(nav, /const isDemoView = isDemoExperiencePath\(pathname, demoParam\)/);
  assert.match(nav, /href=\{isDemoView \? demoNavigationHref\(href\) : href\}/);
  assert.equal(demoNavigationHref("/inspectorhub"), "/demo/inspector");
  assert.equal(demoNavigationHref("/client-dashboard"), "/demo/client");
  assert.equal(isDemoExperiencePath("/demo/client-inspections"), true);
  assert.equal(isDemoExperiencePath("/client-dashboard"), false);
});
