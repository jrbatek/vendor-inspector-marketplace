import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const home = fs.readFileSync(path.join(process.cwd(), "app/page.tsx"), "utf8");
const nav = fs.readFileSync(path.join(process.cwd(), "components/Nav.tsx"), "utf8");
const layout = fs.readFileSync(path.join(process.cwd(), "app/layout.tsx"), "utf8");
const demoBanner = fs.readFileSync(path.join(process.cwd(), "components/DemoModeBanner.tsx"), "utf8");

test("home page uses the InspectSource brand line and separates client and inspector paths", () => {
  assert.match(home, /Eyes, Ears, and Expertise, Everywhere\./);
  assert.match(home, /For Clients/);
  assert.match(home, /For Inspectors/);
  assert.match(home, /Find Inspectors/);
  assert.match(home, /Explore InspectorHub/);
});

test("client and inspector logins live inside their respective navigation dropdowns", () => {
  assert.match(nav, /\{ label: "Clients", links: \[\s*\["Client Login", "\/login\?role=client"\]/);
  assert.match(nav, /\{ label: "Inspectors", links: \[\s*\["Inspector Login", "\/login\?role=inspector"\]/);
  assert.doesNotMatch(nav, /className="loginNav"/);
});

test("demo banner is global and only appears when no authenticated user is present", () => {
  assert.match(layout, /<DemoModeBanner \/>/);
  assert.match(demoBanner, /setIsDemo\(!data\.user\)/);
  assert.match(demoBanner, /setIsDemo\(!session\?\.user\)/);
  assert.match(demoBanner, /if \(isDemo !== true\) return null/);
  assert.match(demoBanner, /Demo Mode/);
  assert.match(demoBanner, /synthetic data/);
});
