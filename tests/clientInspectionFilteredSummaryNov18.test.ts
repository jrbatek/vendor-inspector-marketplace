import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { ACTIVE_DEMO_INSPECTIONS, EMPTY_INSPECTION_FILTERS, filterActiveInspections } from "../lib/clientActiveInspections";

const page = readFileSync("app/demo/client-inspections/page.tsx", "utf8");
const smoke = readFileSync("scripts/smoke-client-inspections.mjs", "utf8");
const summary = page.slice(page.indexOf('<div className="stats"'), page.indexOf('<section className="filters"'));

test("Client Demo inspection KPIs reflect the same filtered cohort as the cards and action queue", () => {
  assert.match(summary, /aria-label="Filtered inspection summary"/);
  for (const expression of [
    "{rows.length}", "new Set(rows.map(row => row.project)).size",
    "rows.filter(row => row.ncrs.length > 0).length",
    "rows.reduce((count, row) => count + row.actions.length, 0)"
  ]) assert.ok(summary.includes(expression), "Missing filtered KPI computation: " + expression);
  assert.doesNotMatch(summary, /ACTIVE_DEMO_INSPECTIONS/, "Summary must not show unfiltered totals as filtered figures");
  assert.match(summary, /Active inspections in view/);
  assert.match(summary, /Outstanding actions in view/);
});

test("filter-dependent counts and restored seven-record view are checked in Chromium", () => {
  const kickoff = filterActiveInspections(ACTIVE_DEMO_INSPECTIONS, {...EMPTY_INSPECTION_FILTERS, stage:"Kickoff"});
  assert.equal(ACTIVE_DEMO_INSPECTIONS.length, 7);
  assert.equal(kickoff.length, 1);
  assert.equal(new Set(kickoff.map(row => row.project)).size, 1);
  assert.match(smoke, /filteredKpis\[0\]\.trim\(\)==="1"/);
  assert.match(smoke, /Browser Back restored inspection detail but left stale filtered summary counts/);
  assert.match(smoke, /Browser Forward restored filter but left an inconsistent inspection summary/);
});
