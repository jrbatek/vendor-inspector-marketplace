import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const source = fs.readFileSync(path.join(process.cwd(), "app/demo/agency/page.tsx"), "utf8");

test("agency demo exposes the complete operational workspace spine", () => {
  for (const marker of [
    "Resource Pool & Affiliations",
    "Bulk Resource Upload",
    "Availability & Capacity",
    "Opportunities & source attribution",
    "Active Inspections",
    "Reports & NCRs",
    "Contracts & Commercials",
    "Agency Analytics",
    "Find Inspectors / Recruiting",
    "Resource-system connectivity",
  ]) assert.match(source, new RegExp(marker.replace(/[&/]/g, "\\$&")));
});

test("agency sidebar uses one purple workspace navigation with real active state", () => {
  assert.match(source, /useState\("overview"\)/);
  assert.match(source, /setActiveSection\(anchor\)/);
  assert.match(source, /aria-current=\{activeSection === anchor \? "page" : undefined\}/);
  assert.match(source, /\.side a\[aria-current=page\]\{background:#6d28d9;color:#fff/);
  assert.doesNotMatch(source, /View Client Demo|View Inspector Demo/);
});

test("capacity and inspection operations are populated synthetic examples", () => {
  assert.match(source, /30-day view/);
  assert.match(source, /Gulf Coast/);
  assert.match(source, /Middle East/);
  assert.match(source, /Europe/);
  assert.match(source, /West Africa/);
  assert.match(source, /tentative/);
  assert.match(source, /blocked/);
  assert.match(source, /report due Sep 21/);
  assert.match(source, /NCR-204/);
  assert.match(source, /Reinspection Sep 23/);
  assert.match(source, /agency\/source attribution/);
});

test("agency demo remains isolated from production and precise location", () => {
  assert.match(source, /fictional records only/);
  assert.match(source, /does not collect precise inspector location/);
  assert.doesNotMatch(source, /supabaseBrowser|createClient|process\.env|navigator\.geolocation/);
});
