import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const source = fs.readFileSync(path.join(process.cwd(), "app/client-dashboard/page.tsx"), "utf8");
const demoHistorySource = fs.readFileSync(path.join(process.cwd(), "app/demo/client-history/page.tsx"), "utf8");

test("inspections in progress is structured into requested workflow groups", () => {
  assert.match(source, /Active Inspections/);
  assert.match(source, /Pending Requests/);
  assert.match(source, /Submitted Reports/);
  assert.match(source, /aria-expanded=/);
});

test("inspection history API promotion is a dismissible right-side highlight", () => {
  assert.match(source, /Inspection History API/);
  assert.match(source, /Dismiss Inspection History API highlight/);
  assert.match(source, /historyLayout\{display:grid;grid-template-columns:minmax\(0,1fr\) 310px/);
  assert.match(source, /\/demo\/client-data/);
});

test("synthetic client history mirrors the dismissible API highlight without production credentials", () => {
  assert.match(demoHistorySource, /Inspection History API/);
  assert.match(demoHistorySource, /Dismiss Inspection History API highlight/);
  assert.match(demoHistorySource, /historyLayout\{display:grid;grid-template-columns:minmax\(0,1fr\) 310px/);
  assert.match(demoHistorySource, /\/demo\/client-data/);
  assert.match(demoHistorySource, /Synthetic demo only\. No credentials or production data are exposed\./);
  assert.doesNotMatch(demoHistorySource, /createClient|supabase|process\.env/);
});

test("client workspace uses a compact section header instead of repeated manage-program hero", () => {
  assert.doesNotMatch(source, /Manage your inspection program/);
  assert.match(source, /workspaceHeader\{display:flex/);
  assert.match(source, /sectionTitle\(section\)/);
});

test("client email intake routes to the instruction page rather than a direct mailto", () => {
  assert.match(source, /href="\/email-requirements"/);
  assert.doesNotMatch(source, /mailto:inspectsource2026@gmail\.com/);
});
