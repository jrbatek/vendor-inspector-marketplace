import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const home = fs.readFileSync(path.join(process.cwd(), "app/page.tsx"), "utf8");
const nav = fs.readFileSync(path.join(process.cwd(), "components/Nav.tsx"), "utf8");
const layout = fs.readFileSync(path.join(process.cwd(), "app/layout.tsx"), "utf8");
const demoBanner = fs.readFileSync(path.join(process.cwd(), "components/DemoModeBanner.tsx"), "utf8");
const whatWeDoPage = path.join(process.cwd(), "app/what-we-do/page.tsx");

test("home page uses the exact InspectSource brand line and separates client and inspector paths", () => {
  assert.match(home, /InspectSource — Eyes, Ears, and Expertise, Everywhere\./);
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
  assert.match(home, /href="\/demo\/client">Open Client Demo/);
  assert.match(home, /Inspector Demo/);
  assert.match(home, /Open Inspector Demo/);
  assert.match(home, /href="\/demo\/inspector">Open Inspector Demo/);
});

test("client and inspector logins live inside their respective navigation dropdowns", () => {
  assert.match(nav, /\{ label: "Clients", links: \[\s*\["Client Login", "\/login\?role=client"\]/);
  assert.match(nav, /\{ label: "Inspectors", links: \[\s*\["Inspector Login", "\/login\?role=inspector"\]/);
  assert.doesNotMatch(nav, /className="loginNav"/);
});

test("Find Inspectors navigation stays on the canonical Client Demo route", () => {
  assert.match(nav, /\["Find Inspectors", "\/demo\/client"\]/);
  assert.doesNotMatch(nav, /\["Find Inspectors", "\/demo-showcase"\]/);
});

test("What We Do is fully removed from navigation and routing", () => {
  assert.doesNotMatch(nav, />What We Do<\/Link>/);
  assert.doesNotMatch(nav, /href="\/what-we-do"/);
  assert.equal(fs.existsSync(whatWeDoPage), false);
});

test("demo banner is route-aware and remains explicit for every synthetic experience", () => {
  assert.match(layout, /<DemoModeBanner \/>/);
  assert.match(demoBanner, /usePathname/);
  assert.match(demoBanner, /if \(!isDemoExperiencePath\(pathname\)\) return null/);
  assert.doesNotMatch(demoBanner, /auth\.getUser|onAuthStateChange/);
  assert.match(demoBanner, /Demo Mode/);
  assert.match(demoBanner, /synthetic data/);
  assert.match(demoBanner, /Demo pages stay synthetic even when you're signed in/);
});

test("home page keeps the brand and audience sections compact while preserving client and inspector color cues", () => {
  assert.match(home, /\.homeShell\{display:grid;gap:16px;padding:6px 0 36px\}/);
  assert.match(home, /\.brandBanner\{[^}]*padding:30px 36px/);
  assert.match(home, /\.audienceCard\{[^}]*min-height:440px;padding:26px/);
  assert.match(home, /\.clientCard\{[^}]*#2563eb/);
  assert.match(home, /\.inspectorCard\{[^}]*#0f766e/);
});
