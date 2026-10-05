import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const read = (file: string) => fs.readFileSync(path.join(process.cwd(), file), "utf8");
const client = read("app/demo/client-agency-sourcing/page.tsx");
const agency = read("app/demo/agency/page.tsx");
const agencyAffiliations = read("app/demo/agency-affiliations/page.tsx");
const inspectorAffiliations = read("app/demo/inspector-affiliations/page.tsx");
const nav = read("components/Nav.tsx");

test("three-sided marketplace exposes client, agency and inspector demo entry points", () => {
  assert.match(nav, /Client Demo/);
  assert.match(nav, /Agency Demo/);
  assert.match(nav, /Inspector Demo/);
  assert.match(nav, /globalLogin/);
  assert.match(agency, /Agency Workspace/);
});

test("client sourcing preserves one-person-many-channels and verified-affiliation rules", () => {
  assert.match(client, /Contracted agencies only/);
  assert.match(client, /Independent inspectors only/);
  assert.match(client, /Contracted agencies \+ independent inspectors/);
  assert.match(client, /Any active Verified agency affiliation suppresses the Independent channel/);
  assert.match(client, /Pending\/unverified claims do not/);
  assert.match(client, /A person appears once even when multiple agency channels are eligible/);
  assert.match(client, /Upload order alone never creates agency ownership/);
  assert.match(client, /Northstar Inspection Partners/);
  assert.match(client, /Atlas Technical Inspection/);
  assert.match(client, /Net 45/);
  assert.match(client, /Net 30/);
});

test("dual-confirmation lifecycle is represented on both agency and inspector sides", () => {
  for (const source of [agencyAffiliations, inspectorAffiliations]) {
    assert.match(source, /Verified/);
    assert.match(source, /Expiring/);
    assert.match(source, /Disputed/);
    assert.match(source, /Expired|Ended/);
    assert.match(source, /Inspector ID|InspectSource ID/);
    assert.match(source, /SSN|passport|national ID/);
    assert.doesNotMatch(source, /supabaseBrowser|createClient|process\.env/);
  }
  assert.match(agencyAffiliations, /Inspector Confirmation Pending/);
  assert.match(agencyAffiliations, /Neither agency claim nor inspector response alone creates Verified status/);
  assert.match(inspectorAffiliations, /reconfirm|reconfirmation/i);
});

test("three-sided marketplace demos retain explicit synthetic-only safety boundaries", () => {
  for (const source of [client, agency, agencyAffiliations, inspectorAffiliations]) {
    assert.match(source, /synthetic|Synthetic/);
  }
  assert.doesNotMatch(client, /supabaseBrowser|createClient|process\.env/);
  assert.doesNotMatch(agencyAffiliations, /supabaseBrowser|createClient|process\.env/);
});
