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

test("home page includes the latest client and inspector workflow benefits", () => {
  assert.match(home, /Manage contracts, approvals and payments/);
  assert.match(home, /Manage billing, documentation, and tax reporting/);
});

test("home page exposes clearly labeled client and inspector demo entry points", () => {
  assert.match(home, /Client Demo/);
  assert.match(home, /Open Client Demo/);
  assert.match(home, /Inspector Demo/);
  assert.match(home, /Open Inspector Demo/);
});

test("client and inspector logins live inside their respective navigation dropdowns", () => {
  assert.match(nav, /\{ label: "Clients", links: \[\s*\["Client Login", "\/login\?role=client"\]/);
  assert.match(nav, /\{ label: "Inspectors", links: \[\s*\["Inspector Login", "\/login\?role=inspector"\]/);
  assert.doesNotMatch(nav, /className="loginNav"/);
});

test("What We Do is not a top-level navigation link", () => {
  assert.doesNotMatch(nav, />What We Do<\/Link>/);
  assert.doesNotMatch(nav, /href="\/what-we-do"/);
});

test("demo banner is global for unauthenticated demo routes but excluded from the public home page", () => {
  assert.match(layout, /<DemoModeBanner \/>/);
  assert.match(demoBanner, /usePathname/);
  assert.match(demoBanner, /setIsDemo\(!data\.user\)/);
  assert.match(demoBanner, /setIsDemo\(!session\?\.user\)/);
  assert.match(demoBanner, /pathname === "\/" \|\| isDemo !== true/);
  assert.match(demoBanner, /Demo Mode/);
  assert.match(demoBanner, /synthetic data/);
});
