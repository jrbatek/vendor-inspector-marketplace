import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const source = fs.readFileSync(path.join(process.cwd(), "app/demo/agency-commercials/page.tsx"), "utf8");

test("agency commercial review exposes contract and portfolio economics", () => {
  for (const marker of ["Client contracts & commercial packages", "Revenue & billing status", "Client & contract performance", "Commercial provenance", "Active client agreements", "Awarded YTD", "Billed YTD", "Resource utilization", "On-time reports", "NCR closure"])
    assert.match(source, new RegExp(marker.replace(/[&]/g, "\\$&")));
});

test("agency commercial packages cover required modeled components", () => {
  for (const marker of ["currency", "payment terms", "mileage", "per diem/meals", "local travel", "travel time", "lodging", "airfare", "mobilization", "overtime/weekend premiums", "report time", "modeled taxes/fees", "Client notes"])
    assert.match(source, new RegExp(marker.replace(/[\/]/g, "\\$&"), "i"));
});

test("commercial review preserves sourcing provenance concepts", () => {
  assert.match(source, /Agency-specific search/);
  assert.match(source, /Broad marketplace search/);
  assert.match(source, /one inspector identity/i);
  assert.match(source, /upload order does not create ownership/i);
  assert.match(source, /Ending an affiliation does not rewrite/);
});

test("commercial review remains synthetic and production isolated", () => {
  assert.match(source, /fictional contracts, rates, budgets and performance only/);
  assert.match(source, /does not execute billing or change inspector compensation/);
  assert.match(source, /remain review-gated/);
  assert.doesNotMatch(source, /supabaseBrowser|createClient|process\.env|navigator\.geolocation/);
});
