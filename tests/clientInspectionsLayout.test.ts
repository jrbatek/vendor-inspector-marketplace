import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const demo = fs.readFileSync("app/demo/client-inspections/page.tsx", "utf8");
const live = fs.readFileSync("app/client-dashboard/page.tsx", "utf8");

test("demo inspections follow the established live Client Workspace layout hierarchy", () => {
  for (const className of ["workspaceHeader", "content", "sectionHead", "stats", "stat", "progressGroup", "groupHead", "groupBody", "inspectionSummary", "details"]) {
    assert.ok(demo.includes(`className="${className}"`), className);
    assert.ok(live.includes(`className="${className}"`) || ["inspectionSummary","details"].includes(className), className);
  }
  assert.match(demo, /Track work by action stage/);
  assert.match(demo, /Active Inspections/);
  assert.match(demo, /<ClientWorkspaceSidebar demo \/>/);
});

test("updated layout retains seven no-login synthetic inspections, filters and detailed actions", () => {
  assert.match(demo, /ACTIVE_DEMO_INSPECTIONS/);
  assert.match(demo, /rows\.map\(row =>/);
  assert.match(demo, /className="inspection"/);
  assert.match(demo, /No login required/);
  assert.match(demo, /Open Inspection/);
  assert.match(demo, /aria-expanded=\{open\}/);
  for (const section of ["Milestones", "Reports", "NCRs", "Outstanding actions"]) assert.ok(demo.includes(section));
  assert.doesNotMatch(demo, /supabaseBrowser|auth\.getUser|router\.replace\("\/login"\)/);
});
