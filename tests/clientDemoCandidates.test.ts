import assert from "node:assert/strict";
import test from "node:test";
import { demoCandidateStartDateIssue, getDemoCandidates } from "../lib/clientDemoCandidates";

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
  assert.deepEqual(getDemoCandidates("API 570 inspector for a piping inspection in Houston, TX"), []);
  assert.deepEqual(getDemoCandidates("Synthetic scope: API 510 vessel inspection, Houston FAT, supplier dossier verification."), []);
});

test("yearless completion dates span New Year using the stated start year", () => {
  const named = "API 570 piping inspector in Houston starting December 29, 2026 through January 5";
  const iso = "API 570 piping inspector in Houston from 2026-12-29 through Jan 5";
  const yearless = "API 570 piping inspector in Houston starting Dec 29 through Jan 5";
  for (const request of [named, iso, yearless]) {
    assert.equal(demoCandidateStartDateIssue(request), null, request);
    assert.deepEqual(getDemoCandidates(request).map(person => person.id), ["IS-1314"], request);
  }
  // Never silently roll a year that was explicitly supplied by the client.
  for (const reversed of [
    "API 570 piping inspector in Houston starting December 29, 2026 through January 5, 2026",
    "API 570 piping inspector in Houston starting December 7, 2026 through December 1",
  ]) {
    assert.match(demoCandidateStartDateIssue(reversed) ?? "", /end date on or after/, reversed);
    assert.deepEqual(getDemoCandidates(reversed), [], reversed);
  }
});

test("an explicit end date must fall inside the candidate’s availability", () => {
  assert.deepEqual(getDemoCandidates("API 570 in Houston from 2026-12-07 through 2027-01-08").map(p => p.id), ["IS-1314"]);
  assert.deepEqual(getDemoCandidates("API 570 in Houston starting December 7 through January 9, 2027"), []);
});

test("available demo candidate CVs require a real explicit start date", () => {
  const missing = "API 570 piping inspector in Houston with TWIC";
  assert.match(demoCandidateStartDateIssue(missing) ?? "", /specific inspection start date/);
  assert.deepEqual(getDemoCandidates(missing), []);
  for (const impossible of ["2026-02-30", "2026-04-31", "2026-12-32", "2026-13-07"]) {
    const request = "API 570 piping inspector in Houston starting " + impossible;
    assert.match(demoCandidateStartDateIssue(request) ?? "", /real calendar start date/, request);
    assert.deepEqual(getDemoCandidates(request), [], request);
  }
  const dated = "API 570 piping inspector in Houston starting December 7 for three weeks";
  assert.equal(demoCandidateStartDateIssue(dated), null);
  assert.deepEqual(getDemoCandidates(dated).map(candidate => candidate.id), ["IS-1042", "IS-1314"]);
});

test("fictional availability rejects impossible explicit completion dates instead of Date.parse rollover", () => {
  const request = "API 570 inspector in Houston starting December 7, 2026 through ";
  for (const invalid of ["November 31, 2026", "February 30, 2027", "2026-11-31", "2027-02-30"]) {
    assert.match(demoCandidateStartDateIssue(request + invalid) ?? "", /real calendar end date/, invalid);
    assert.deepEqual(getDemoCandidates(request + invalid), [], invalid);
  }
  assert.equal(demoCandidateStartDateIssue(request + "December 30, 2026"), null);
  assert.deepEqual(getDemoCandidates(request + "December 30, 2026").map(c=>c.id), ["IS-1042", "IS-1314"]);
  // An ISO completion date must not replace the actual stated start.
  assert.deepEqual(getDemoCandidates("API 570 in Houston from 2026-12-07 through 2026-12-30").map(c=>c.id), ["IS-1042", "IS-1314"]);
  assert.equal(demoCandidateStartDateIssue("API 570 in Houston from 2026-12-07 through 2026-11-31")?.includes("end date"), true);
  assert.deepEqual(getDemoCandidates("API 570 in Houston from 2026-12-07 through 2026-11-31"), []);
});

test("a real completion day before the start explains the reversed fictional availability window", () => {
  for (const request of [
    "API 570 inspector in Houston starting December 7, 2026 through December 1, 2026",
    "API 570 inspector in Houston from 2026-12-07 through 2026-12-01"
  ]) {
    assert.match(demoCandidateStartDateIssue(request) ?? "", /end date on or after the requested start date/, request);
    assert.deepEqual(getDemoCandidates(request), [], request);
  }
  assert.equal(demoCandidateStartDateIssue("API 570 in Houston from 2026-12-07 through 2026-12-07"), null);
});
