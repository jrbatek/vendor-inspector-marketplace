import assert from "node:assert/strict";
import test from "node:test";
import { getDemoCandidates } from "../lib/clientDemoCandidates";

const houston = "We need two API 570 inspectors for a refinery turnaround in Houston starting December 7 for approximately three weeks. API 570 certification, minimum 5 years refinery/petrochemical experience, current TWIC card, availability for 10-12 hour shifts, and local Houston inspectors preferred. Please send qualified CVs/resumes, availability, and rates.";

test("the seeded request returns two local sample CVs available for the entire turnaround", () => {
  const candidates = getDemoCandidates(houston);
  assert.deepEqual(candidates.map(candidate => candidate.id), ["IS-1042", "IS-1314"]);
  assert.deepEqual(candidates.map(candidate => candidate.name), ["Avery Calder", "Maya Ellison"]);
  assert.equal(new Set(candidates.map(candidate => candidate.name)).size, candidates.length);
  for (const candidate of candidates) {
    assert.equal(candidate.location, "Houston, Texas");
    assert.ok(candidate.credentials.includes("API 570") && candidate.credentials.includes("TWIC"));
    assert.ok(candidate.dayRateUsd > 0 && candidate.workHistory.length > 0);
    assert.match(candidate.availability, /Dec .*, 2026/);
    assert.match(candidate.shifts, /12 hours/);
  }
});

test("results follow the edited qualification, geography, budget and experience", () => {
  assert.deepEqual(getDemoCandidates("API 510 inspector in Houston starting December 7 for 3 weeks at USD 900/day").map(p => p.id), ["IS-1314"]);
  assert.deepEqual(getDemoCandidates("API 570 inspector in beaumont starting January 4, 2027 for two weeks").map(p => p.id), ["IS-1187"]);
  assert.deepEqual(getDemoCandidates(houston.replace("minimum 5 years", "minimum 12 years")).map(p => p.id), ["IS-1042"]);
  for (const scope of [
    houston.replace(/Houston/g, "Singapore"), houston.replace(/API 570/g, "API 653"),
    houston.replace("10-12 hour", "16-hour"), `${houston} Budget USD 500/day.`,
    "An API-1169 inspector is needed for a Houston pipeline.",
    "Please send someone to paint a portrait this weekend.",
  ]) assert.deepEqual(getDemoCandidates(scope), [], scope);
});

test("windows include their last day and exclude starts or durations outside the roster", () => {
  const scope = "API 570 piping inspector in Houston starting December 7 for ";
  assert.equal(getDemoCandidates(scope + "25 days").length, 2);
  assert.deepEqual(getDemoCandidates(scope + "26 days").map(p => p.id), ["IS-1314"]);
  assert.deepEqual(getDemoCandidates(scope + "two months"), []);
  assert.deepEqual(getDemoCandidates(houston.replace("December 7", "December 7 2027")), []);
});

test("common dollar budgets select the lower rate and unsupported currencies stay unmatched", () => {
  for (const qualifier of ["under", "for", "max"]) {
    const scope = `API 570 in Houston for 3 weeks starting Dec 7, 2026 ${qualifier} $900/day`;
    assert.deepEqual(getDemoCandidates(scope).map(p => p.id), ["IS-1314"]);
  }
  assert.deepEqual(getDemoCandidates("API 570 in Houston for CAD $900/day"), []);
  assert.equal(getDemoCandidates("API 570 inspector for a piping inspection in Houston, TX").length, 2);
  assert.deepEqual(getDemoCandidates("Synthetic scope: API 510 vessel inspection, Houston FAT, supplier dossier verification.").map(p => p.id), ["IS-1314"]);
});

test("an explicit end date must fall inside the candidate’s availability", () => {
  assert.deepEqual(getDemoCandidates("API 570 in Houston from 2026-12-07 through 2027-01-08").map(p => p.id), ["IS-1314"]);
  assert.deepEqual(getDemoCandidates("API 570 in Houston starting December 7 through January 9, 2027"), []);
});
