import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { AGENCY_RESOURCE_POOL, AGENCY_SYNTHETIC_RESOURCE_TOTAL } from "../lib/agencyDemoResources";

const src = readFileSync("app/demo/agency-affiliations/page.tsx", "utf8");

test("nested Agency affiliation summary uses the same synthetic marketplace resource count", () => {
  assert.equal(AGENCY_RESOURCE_POOL.length, 2823);
  assert.equal(AGENCY_SYNTHETIC_RESOURCE_TOTAL, AGENCY_RESOURCE_POOL.length);
  assert.match(src, /AGENCY_SYNTHETIC_RESOURCE_TOTAL\.toLocaleString\("en-US"\)/);
  assert.match(src, /Total agency resources/);
  assert.match(src, /AGENCY_RESOURCE_POOL\.filter\(row => row\.affiliation === "Verified"\)/);
  assert.match(src, /AGENCY_RESOURCE_POOL\.filter\(row => row\.affiliation === "Confirmation pending"\)/);
  assert.match(src, /AGENCY_RESOURCE_POOL\.filter\(row => row\.affiliation === "Expiring"\)/);
  assert.match(src, /AGENCY_RESOURCE_POOL\.filter\(row => row\.affiliation === "Disputed"\)/);
  assert.doesNotMatch(src, /<b>126<\/b>|<b>108<\/b>|<b>7<\/b>|<b>6<\/b>|<b>2<\/b>/);
});

test("agency affiliation lifecycle sample remains five fictional examples, not live identities", () => {
  assert.match(src, /Showing \{visible\.length\} of \{affiliations\.length\} synthetic affiliation examples/);
  assert.match(src, /No production identity, notification, authorization or matching changes/);
  assert.doesNotMatch(src, /supabaseBrowser|createClient\(|XMLHttpRequest|fetch\(/);
});
