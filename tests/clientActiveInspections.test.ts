import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { ACTIVE_DEMO_INSPECTIONS as rows, EMPTY_INSPECTION_FILTERS as empty, filterActiveInspections, searchActiveInspections, activeInspectionReportHref } from "../lib/clientActiveInspections";
import { demoNavigationHref } from "../lib/demoExperience";

const read = (file: string) => fs.readFileSync(file, "utf8");

test("active demo has seven distinct, populated synthetic inspection workspaces", () => {
  assert.equal(rows.length, 7);
  for (const field of ["id", "project", "vendor", "site", "inspector", "stage", "start"] as const) {
    assert.equal(new Set(rows.map(row => row[field])).size, 7, field);
  }
  for (const row of rows) {
    for (const field of ["client", "contact", "scope", "po", "equipment"] as const) assert.ok(row[field], field);
    assert.ok(row.start <= row.end);
    assert.ok(row.milestones.length >= 3);
    assert.ok(row.reports.length);
    assert.ok(row.actions.every(action => action.task && action.owner && action.due));
    assert.ok(row.id.startsWith("DEMO-"));
  }
  assert.ok(rows.some(row => row.ncrs.length));
  assert.ok(rows.some(row => !row.ncrs.length));
});

test("filters work independently, combine, and reset without mutating the dataset", () => {
  const first = rows[0];
  for (const [key, value] of [["stage", first.stage], ["project", first.project], ["inspector", first.inspector]] as const) {
    assert.deepEqual(filterActiveInspections(rows, { ...empty, [key]: value }), [first]);
  }
  assert.deepEqual(filterActiveInspections(rows, { ...empty, stage: first.stage, project: first.project, inspector: first.inspector }), [first]);
  assert.deepEqual(filterActiveInspections(rows, { ...empty, stage: first.stage, project: rows[1].project }), []);
  assert.equal(filterActiveInspections(rows, empty).length, 7);
});

test("date filter uses inclusive schedule overlap and handles empty and reversed ranges", () => {
  assert.deepEqual(filterActiveInspections(rows, { ...empty, from: "2026-11-20", to: "2026-11-20" }), [rows[1]]);
  assert.equal(filterActiveInspections(rows, { ...empty, to: "2026-10-28" }).length, 1);
  assert.equal(filterActiveInspections(rows, { ...empty, from: "2027-01-01" }).length, 0);
  assert.equal(filterActiveInspections(rows, { ...empty, from: "2026-11-10", to: "2026-11-01" }).length, 0);
});

test("sample PDF links encode inspection details and request an attachment", () => {
  for (const row of rows) {
    const href = new URL(activeInspectionReportHref(row, row.reports[0]), "http://local");
    assert.equal(href.pathname, "/api/demo/report");
    assert.equal(href.searchParams.get("project"), row.project);
    assert.equal(href.searchParams.get("supplier"), row.vendor);
    assert.equal(href.searchParams.get("inspector"), row.inspector);
    assert.equal(href.searchParams.get("ncr"), row.ncrs.length ? "1" : "0");
    assert.equal(href.searchParams.get("download"), "1");
  }
});

test("demo entry and open inspection controls preserve demo/live separation", () => {
  const page = read("app/demo/client-inspections/page.tsx");
  assert.match(read("app/demo/client/page.tsx"), /href:"\/demo\/client-inspections"/);
  assert.match(read("components/ClientWorkspaceSidebar.tsx"), /demo\?"\/demo\/client-inspections"/);
  assert.match(page, /Open Inspection/);
  assert.match(page, /aria-expanded=\{open\}/);
  assert.match(page, /aria-controls=/);
  for (const title of ["Milestones", "Reports", "NCRs", "Outstanding actions"]) assert.ok(page.includes(title));
  for (const label of ["Status / stage", "Project", "Inspector"]) assert.ok(page.includes(`aria-label="${label}"`));
  assert.match(page, /No inspections match/);
  assert.match(page, /setFilters\(EMPTY_INSPECTION_FILTERS\)/);
  assert.doesNotMatch(page, /supabase|auth\.|createClient|fetch\(/);
  const live = read("app/client-dashboard/page.tsx");
  assert.match(live, /if\(!auth.user\)\{router.replace\("\/login"\);return;\}/);
  assert.match(live, /if\(!authenticated\)return/);
  assert.doesNotMatch(live, /label="Inspection History"/);
  assert.match(live, /section==="analytics"&&<><HistorySection/);
});

test("global audience order and demo navigation keep synthetic experiences in demo routes", () => {
  const nav = read("components/Nav.tsx");
  assert.ok(nav.indexOf('label: "Clients"') < nav.indexOf('label: "Inspectors"'));
  assert.ok(nav.indexOf('label: "Inspectors"') < nav.indexOf('label: "Agencies"'));
  const home = read("app/page.tsx");
  assert.ok(home.indexOf('For Clients') < home.indexOf('For Inspectors'));
  assert.ok(home.indexOf('For Inspectors') < home.indexOf('For Agencies'));
  for (const [, href] of Array.from(nav.matchAll(/\["[^"]+", "([^"]+)"\]/g))) {
    const target = demoNavigationHref(href);
    assert.ok(target.startsWith("/demo/"), target);
    assert.ok(fs.existsSync(`app${target.split("#")[0]}/page.tsx`), target);
  }
  assert.match(nav, /href=\{isDemoView \? demoNavigationHref\(href\) : href\}/);
});

function luminance(hex: string) {
  const rgb = hex.match(/[a-f\d]{2}/gi)!.map(channel => parseInt(channel, 16) / 255).map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4);
  return .2126 * rgb[0] + .7152 * rgb[1] + .0722 * rgb[2];
}

test("P0-B controls have explicit contrasting foregrounds, backgrounds and focus states", () => {
  const page = read("app/demo/client-inspections/page.tsx");
  assert.match(page, /button\{background:#1e40af;color:#fff/);
  assert.match(page, /button.reset\{background:#fff;color:#1e40af/);
  assert.match(page, /select,\.filters input\{color:#0f172a;background:#fff/);
  assert.match(page, /:focus-visible/);
  for (const foreground of ["1e40af", "1e3a8a", "0f172a"]) {
    assert.ok((luminance("ffffff") + .05) / (luminance(foreground) + .05) >= 4.5);
  }
});

test("fictional inspection keyword search spans project, vendor, inspector and report/NCR references", () => {
  const original = rows.map(row => row.id);
  assert.deepEqual(searchActiveInspections(rows, " BAYOU  vessel "), [rows[0]]);
  assert.deepEqual(searchActiveInspections(rows, "North Sea Esbjerg"), [rows[1]]);
  assert.deepEqual(searchActiveInspections(rows, "SAMPLE-ACT-3"), [rows[2]]);
  assert.deepEqual(searchActiveInspections(rows, "SAMPLE-NCR-001"), [rows[4]]);
  assert.deepEqual(searchActiveInspections(rows, "traceability manager"), [rows[4]]);
  assert.deepEqual(searchActiveInspections(rows, "unrelated imaginary inspection"), []);
  assert.equal(searchActiveInspections(rows, " ").length, 7);
  assert.deepEqual(rows.map(row => row.id), original, "search must not mutate synthetic fixtures");
  assert.deepEqual(searchActiveInspections(filterActiveInspections(rows, { ...empty, stage: rows[4].stage }), "SAMPLE-NCR-001"), [rows[4]]);
  assert.deepEqual(searchActiveInspections(filterActiveInspections(rows, { ...empty, stage: rows[0].stage }), "SAMPLE-NCR-001"), []);
});

test("keyword search remains demo-local and resets with other inspection filters", () => {
  const page = read("app/demo/client-inspections/page.tsx");
  assert.match(page, /type="search" aria-label="Search inspections"/);
  assert.match(page, /searchActiveInspections\(filterActiveInspectionsByActionDue/);
  assert.match(page, /setKeyword\(" "\)|setKeyword\(".."\)|setKeyword\(""\)/);
  assert.doesNotMatch(page, /fetch\(|createClient|supabase/);
});


test("fictional NCR case expands into an accountable corrective-action and verification record", () => {
  const record = rows.find(row => row.ncrs.length > 0);
  assert.ok(record);
  const ncr = record.ncrs[0];
  assert.equal(ncr.id, "SAMPLE-NCR-001");
  assert.equal(ncr.severity, "Major");
  assert.match(ncr.raised, /^2026-11-\d{2}$/);
  assert.match(ncr.responseDue, /^2026-11-\d{2}$/);
  for (const key of ["owner", "correctiveAction", "verification"] as const) assert.ok(ncr[key].length > 20, key);
  assert.deepEqual(searchActiveInspections(rows, "traceability matrix"), [record]);
  assert.deepEqual(searchActiveInspections(rows, "verification unrelated"), []);
  const page = read("app/demo/client-inspections/page.tsx");
  assert.match(page, /Open corrective-action details/);
  assert.match(page, /aria-expanded=\{expandedNcr === ncr.id\}/);
  assert.match(page, /Corrective-action details for/);
  assert.match(page, /setExpandedNcr\(null\)/);
  assert.match(page, /\.ncrToggle:focus-visible/);
  assert.doesNotMatch(page, /supabase|createClient|fetch\(/);
});


test("synthetic NCR follow-up deadline and ownership align with the inspection action queue", () => {
  const caseRecord = rows.find(row => row.ncrs.some(ncr => ncr.id === "SAMPLE-NCR-001"));
  assert.ok(caseRecord);
  const ncr = caseRecord.ncrs[0];
  assert.equal(ncr.responseDue, caseRecord.actions[0].due);
  assert.equal(ncr.owner, caseRecord.actions[0].owner);
  assert.equal(caseRecord.stage, "NCR follow-up");
  assert.ok(ncr.correctiveAction.includes("HX-45"));
  assert.ok(ncr.verification.includes("Inspector IS-1536"));
});

test("open NCR focus is synthetic-only, accessible and composes with existing inspection controls", () => {
  const cases = rows.filter(row => row.ncrs.some(ncr => ncr.status.startsWith("Open")));
  assert.equal(cases.length, 1);
  assert.equal(cases[0].project, "Pacific Hydrogen Hub");
  const page = read("app/demo/client-inspections/page.tsx");
  assert.match(page, /aria-label="Non-conformance focus"/);
  assert.match(page, /With open NCR \(\{openNcrCount\}\)/);
  assert.match(page, /setNcrOnly\(false\)/);
  assert.match(page, /!ncrOnly \|\| row\.ncrs\.some/);
  assert.match(page, /setExpandedNcr\(null\)/);
  assert.doesNotMatch(page, /supabase|createClient|fetch\(/);
});

test("fictional action owner filter is accessible, resettable and does not persist anything", () => {
 const owners = new Set(rows.flatMap(row => row.actions.map(action => action.owner)));
 assert.equal(owners.size, 7);
 assert.equal(rows.filter(row => row.actions.some(action => action.owner === "Vendor quality manager")).length, 1);
 const page = read("app/demo/client-inspections/page.tsx");
 assert.match(page,/aria-label="Action owner"/);
 assert.match(page,/row\.actions\.some\(action => action\.owner === actionOwner\)/);
 assert.match(page,/setActionOwner\(" "\)|setActionOwner\(""\)/);
 assert.match(page,/actionOwners\.map\(owner => <option/);
 assert.doesNotMatch(page,/supabase|createClient|fetch\(/);
});

test("milestones tell a coherent progressive story across seven fictional active delivery stages",()=>{
 const actual=rows.map(row=>row.milestones.map(milestone=>milestone.status));
 assert.deepEqual(actual,[
  ["In progress","Upcoming","Upcoming"],
  ["Complete","In progress","Upcoming"],
  ["Complete","In progress","Upcoming"],
  ["Complete","In progress","Upcoming"],
  ["Complete","In progress","Upcoming"],
  ["Complete","Complete","In progress"],
  ["Complete","Complete","In progress"],
 ]);
 assert.equal(rows[0].milestones[1].name,"ITP review and approval","Kickoff should not duplicate itself as a future milestone");
 assert.equal(rows[4].milestones[1].name,"NCR follow-up","Corrective action remains active, not falsely completed");
 assert.equal(rows[6].milestones[2].status,"In progress","Release prep cannot falsely claim a completed release");
 const page=read("app/demo/client-inspections/page.tsx");
 assert.match(page,/className="milestoneSummary"/);
 assert.match(page,/milestones.filter\(milestone => milestone.status === "Complete"\).length/);
 assert.match(page,/\.inspectionSummary \.milestoneSummary\{font-weight:800;color:#334155/);
 assert.doesNotMatch(page,/createClient|supabase|fetch\(/);
});

test("invalid Client Demo schedule ranges show date correction, not a misleading no-inspections message",()=>{
 const page=read("app/demo/client-inspections/page.tsx");
 assert.match(page,/invalidDates \? "Correct the scheduled date range" : "No inspections match these filters"/);
 assert.match(page,/invalidDates \? clearInvalidDates : reset/);
 assert.match(page,/setFilters\(current => \(\{ \.\.\.current, from: "", to: "" \}\)\)/);
 assert.match(page,/aria-invalid=\{invalidDates\}/);
 assert.match(page,/onClick=\{invalidDates \? clearInvalidDates : reset\}/);
 assert.doesNotMatch(page,/supabase|createClient|fetch\(/);
});
