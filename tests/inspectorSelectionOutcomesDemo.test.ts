import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { MIN_PEER_COHORT, DEMO_PEER_COHORTS, summarizePeerCohort, peerPositioning } from "../lib/inspectorPeerPositioning";

const source = fs.readFileSync("app/demo/inspector-selection-outcomes/page.tsx", "utf8");
const cohort = DEMO_PEER_COHORTS[0];

test("peer filters select a relevant aggregate group and vary positioning", () => {
  const first = peerPositioning(cohort);
  const next = peerPositioning(DEMO_PEER_COHORTS[1]);
  assert.equal(first.available, true);
  assert.equal(next.available, true);
  if (first.available && next.available) assert.notEqual(first.ratePercentile, next.ratePercentile);
  assert.deepEqual(peerPositioning({ geography: "unknown", expertise: cohort.expertise, inspectionType: cohort.inspectionType }), { available: false });
});

test("small cohorts suppress counts and all comparative metrics at the boundary", () => {
  for (const size of [0, 1, MIN_PEER_COHORT - 1, NaN, Infinity, -1, 10.5]) {
    assert.deepEqual(summarizePeerCohort({ ...cohort, size }), { available: false });
  }
  assert.equal(summarizePeerCohort({ ...cohort, size: MIN_PEER_COHORT }).available, true);
  assert.deepEqual(peerPositioning(DEMO_PEER_COHORTS[7]), { available: false });
});

test("invalid rate statistics fail closed", () => {
  for (const ratePercentile of [-1, 101, NaN, Infinity]) {
    assert.deepEqual(summarizePeerCohort({ ...cohort, ratePercentile }), { available: false });
  }
});

test("peer metrics cover the approved evidence and behavior dimensions", () => {
  for (const row of DEMO_PEER_COHORTS) {
    assert.equal(row.metrics.length, 6);
    for (const label of ["Availability", "Qualifications", "Relevant experience", "Travel flexibility", "Valid response behavior", "Profile completeness / verification"]) {
      assert.ok(row.metrics.some(metric => metric.label === label && metric.own && metric.comparison && metric.guidance));
    }
  }
});

test("ratings precede comparisons and filters have stable accessible names", () => {
  assert.ok(source.indexOf('className="ratings"') < source.indexOf('className="comparison"'));
  for (const label of ["Geography", "Expertise", "Inspection type"]) assert.ok(source.includes(`aria-label="${label}"`));
  assert.match(source, /setFilters\(INITIAL_FILTERS\)/);
  assert.match(source, /summary.available \?/);
  assert.match(source, /Percentiles and comparative metrics are hidden/);
  assert.match(source, /not a recommendation to lower your rate/);
});

test("insights remain synthetic and contain no individual outcomes or live data access", () => {
  assert.match(source, /Demo Mode · Synthetic data/);
  assert.match(source, /deterministic synthetic examples/);
  assert.match(source, /authorized server-side aggregation/);
  assert.match(source, /minimum-cohort protections/);
  assert.doesNotMatch(source, /Presented|Shortlisted|Selected ·|who was selected|supabaseBrowser|\.from\(|fetch\(/);
  const hub = fs.readFileSync("app/inspectorhub/page.tsx", "utf8");
  const demoOnly = hub.split('{mode==="demo"&&<>')[1].split('</>}')[0];
  assert.ok(demoOnly.includes('/demo/inspector-selection-outcomes'));
});
