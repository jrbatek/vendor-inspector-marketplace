import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { ACTIVE_DEMO_INSPECTIONS as rows, EMPTY_INSPECTION_FILTERS as empty, filterActiveInspections, activeInspectionReportHref } from "../lib/clientActiveInspections";
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
