import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const page = fs.readFileSync("app/demo/agency/page.tsx", "utf8");
const activeInspectionSource = fs.readFileSync("app/demo/agency/ActiveInspectionsClient.tsx", "utf8");
import { AGENCY_FEATURED_RESOURCES } from "../lib/agencyDemoResources";

test("Agency Demo synthetic resource availability is aligned to November 2026", () => {
  const availabilityLabels = AGENCY_FEATURED_RESOURCES.map(resource => resource.capacity);
  assert.match(page, /AGENCY_FEATURED_RESOURCES\.map/);
  for (const date of ["Nov 12, 2026", "Nov 14, 2026", "Nov 16, 2026", "Nov 19, 2026"]) {
    assert.ok(availabilityLabels.includes("Available " + date), date);
  }
  assert.doesNotMatch(availabilityLabels.join(" "), /Available Sep \d{1,2}/);
});

test("Agency Demo inspection and NCR workflow dates are future windows, not stale September labels", () => {
  for (const label of ["Mechanical test witness report · draft due Nov 16", "Supplier material certificate response due Nov 17", "reinspection Nov 20", "Draft due Nov 16, 2026", "Reinspection Nov 20, 2026"]) {
    assert.ok((page + activeInspectionSource).includes(label), label);
  }
  assert.doesNotMatch(page + activeInspectionSource, /\bSep \d{1,2}\b/);
});

test("Agency Demo date fixture changes remain synthetic and read-only", () => {
  assert.match(page, /Demo Mode/);
  assert.match(page, /Nothing on this page reads from or writes to production/);
  assert.match(page, /syntheticRosterHref/);
  assert.doesNotMatch(page, /supabaseBrowser|createClient|navigator\.geolocation/);
});
