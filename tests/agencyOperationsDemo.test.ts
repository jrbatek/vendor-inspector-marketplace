import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const source = fs.readFileSync(path.join(process.cwd(), "app/demo/agency/page.tsx"), "utf8");
const activeInspectionSource = fs.readFileSync(path.join(process.cwd(), "app/demo/agency/ActiveInspectionsClient.tsx"), "utf8");

test("agency demo exposes the complete operational workspace spine", () => {
  for (const marker of [
    "Resource Pool & Affiliations",
    "Mass Resource Connect",
    "Availability & Capacity",
    "Opportunities & source attribution",
    "Active Inspections",
    "Reports & NCRs",
    "Contracts & Commercials",
  ]) assert.match(source, new RegExp(marker.replace(/[&/]/g, "\\$&")));
});

test("agency sidebar uses one purple workspace navigation with real active state", () => {
  assert.match(source, /useState\("overview"\)/);
  assert.match(source, /scrollToSection\(event,anchor\)/);
 assert.match(source, /window\.addEventListener\("scroll",updateActive/);
  assert.match(source, /aria-current=\{activeSection === anchor \? "page" : undefined\}/);
  assert.match(source, /\.side a\[aria-current=page\]\{background:#6d28d9;color:#fff/);
  assert.doesNotMatch(source, /View Client Demo|View Inspector Demo/);
});

test("capacity and inspection operations are populated synthetic examples", () => {
  assert.match(source + activeInspectionSource, /30-day view/);
  assert.match(source + activeInspectionSource, /Gulf Coast/);
  assert.match(source + activeInspectionSource, /Middle East/);
  assert.match(source + activeInspectionSource, /Europe/);
  assert.match(source + activeInspectionSource, /West Africa/);
  assert.match(source + activeInspectionSource, /tentative/);
  assert.match(source + activeInspectionSource, /blocked/);
  assert.match(source + activeInspectionSource, /Mechanical test witness report · draft due Nov 16/);
  assert.match(source + activeInspectionSource, /Open Inspection/);
  assert.match(source + activeInspectionSource, /NCR-204/);
  assert.match(source + activeInspectionSource, /Reinspection Nov 20, 2026/);
  assert.match(source + activeInspectionSource, /agency\/source attribution/);
});

test("agency demo remains isolated from production and precise location", () => {
  assert.match(source, /fictional records only/);
  assert.match(source, /does not collect precise inspector location/);
  assert.doesNotMatch(source, /supabaseBrowser|createClient|process\.env|navigator\.geolocation/);
});


test("agency demo primary actions are usable and always synthetic",()=>{
 assert.match(source,/const syntheticRosterHref = `data:text\/csv;charset=utf-8,/);
 assert.match(source,/download="inspectsource-agency-synthetic-roster.csv"/);
 assert.match(source,/SYN-1001,Sample Inspector A/);
 assert.match(source,/aria-expanded=\{claimOpen\}/);
 assert.match(source,/setClaimOpen\(current => !current\)/);
 assert.match(source,/href="\/demo\/agency-affiliations"/);
 assert.match(source,/\.actionLink:focus-visible/);
 assert.doesNotMatch(source,/id="analytics"|id="integrations"|id="find-inspectors-recruiting"|marketplaceOpen/);
 assert.doesNotMatch(source,/<button>Search marketplace<\/button>|<button>Download synthetic template<\/button>/);
});
