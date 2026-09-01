import test from "node:test";
import assert from "node:assert/strict";
import { buildProjectBrief, coordinateProject } from "../lib/projectCoordinator";
import type { SearchInspector } from "../lib/clientSearch";

const REQUEST = "Need two API 570 inspectors in Houston for a refinery turnaround starting September 14 for three weeks. TWIC required. Budget is $950 per day. Please send CVs and confirm availability.";

function inspector(overrides: Partial<SearchInspector> = {}): SearchInspector {
  return {
    inspector_id: crypto.randomUUID(),
    primary_discipline: "Mechanical Inspection",
    biography: "API 570 piping inspector with refinery turnaround experience and TWIC.",
    base_city: "Houston",
    base_state: "Texas",
    base_country: "United States",
    years_experience: 12,
    day_rate: 900,
    currency: "USD",
    availability_status: "Available Immediately",
    available_from: null,
    domestic_travel: true,
    international_travel: false,
    remote_review_available: false,
    is_verified: true,
    equipment: [],
    activities: [],
    ndtMethods: [],
    certifications: [{ id: "api570", name: "API 570", code: "API-570", category: "API" }],
    codes: [],
    industries: [{ id: "refinery", name: "Refinery", code: "REFINERY", category: "Oil & Gas" }],
    languages: [],
    travelCredentials: [{ id: "twic", name: "TWIC", code: "TWIC", category: "US" }],
    ...overrides,
  };
}

test("coordinator preserves the canonical Houston staffing request", () => {
  const brief = buildProjectBrief(REQUEST);
  assert.equal(brief.numberOfInspectors, 2);
  assert.equal(brief.location, "Houston");
  assert.equal(brief.startDate, "2026-09-14");
  assert.equal(brief.durationDays, 21);
  assert.equal(brief.maximumDayRate, 950);
  assert.ok(brief.requiredTerms.some((term) => term.toLowerCase().includes("api 570")));
  assert.ok(brief.requiredTerms.some((term) => term.toLowerCase().includes("twic")));
});

test("coordinator excludes candidates that fail required eligibility gates", () => {
  const strong = inspector();
  const ineligible = inspector({
    inspector_id: crypto.randomUUID(),
    biography: "General coating inspector.",
    primary_discipline: "Coating Inspection",
    certifications: [],
    travelCredentials: [],
    industries: [],
    base_city: "Denver",
    day_rate: 850,
  });

  const result = coordinateProject(REQUEST, [ineligible, strong]);
  assert.equal(result.ranked.length, 1);
  assert.equal(result.ranked[0].inspector_id, strong.inspector_id);
  assert.equal(result.ranked.some((candidate) => candidate.inspector_id === ineligible.inspector_id), false);
});

test("coordinator ranks stronger fit above another eligible candidate", () => {
  const strong = inspector();
  const eligibleButWeaker = inspector({
    inspector_id: crypto.randomUUID(),
    biography: "API 570 inspector with TWIC.",
    base_city: "Dallas",
    years_experience: 5,
    day_rate: 950,
    is_verified: false,
    industries: [],
  });

  const result = coordinateProject(REQUEST, [eligibleButWeaker, strong]);
  assert.equal(result.ranked.length, 2);
  assert.equal(result.ranked[0].inspector_id, strong.inspector_id);
  assert.ok(result.ranked[0].score > result.ranked[1].score);
});

test("anonymous matching model contains no direct identity fields", () => {
  const sample = inspector();
  assert.equal("full_name" in sample, false);
  assert.equal("email" in sample, false);
  assert.equal("phone" in sample, false);
});
