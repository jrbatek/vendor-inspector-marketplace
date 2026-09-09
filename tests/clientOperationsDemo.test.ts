import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const page = fs.readFileSync(path.join(process.cwd(), "app/demo/client-operations/page.tsx"), "utf8");
const nav = fs.readFileSync(path.join(process.cwd(), "components/Nav.tsx"), "utf8");

test("client operations demo exposes populated synthetic billing", () => {
  assert.match(page, /Billing & Payment/);
  assert.match(page, /Invoices, balances, approvals and payment history/);
  assert.match(page, /Awaiting approval/);
  assert.match(page, /Open balance/);
  assert.match(page, /Purchase order/);
  assert.match(page, /No payment credentials, bank data or real financial account details/);
});

test("client operations demo structures contracts by relationship type with expandable synthetic detail", () => {
  assert.match(page, /InspectSource/);
  assert.match(page, /Agencies/);
  assert.match(page, /Individual Inspectors/);
  assert.match(page, /Others/);
  assert.match(page, /Document preview/);
  assert.match(page, /Approval history/);
  assert.match(page, /aria-expanded=\{openRow\}/);
  assert.match(page, /No e-signature, legal acceptance or production contract mutation/);
});

test("client profile demo covers requested identity, preference, role and approval concepts", () => {
  assert.match(page, /Login email/);
  assert.match(page, /Phone \/ SMS/);
  assert.match(page, /Preferred contact/);
  assert.match(page, /coarse city-level only/);
  assert.match(page, /Title \/ department/);
  assert.match(page, /Timezone/);
  assert.match(page, /Notifications/);
  assert.match(page, /Access level \/ roles/);
  assert.match(page, /Approval authority/);
  assert.match(page, /Account security/);
  assert.match(page, /precise geolocation is not collected/);
});

test("client operations demo is explicitly synthetic and read-only", () => {
  assert.match(page, /Client Demo · Synthetic data/);
  assert.match(page, /read-only/i);
  assert.match(page, /never writes to production/);
  assert.doesNotMatch(page, /supabaseBrowser/);
  assert.doesNotMatch(page, /\.from\(/);
});

test("client navigation exposes the operations demo", () => {
  assert.match(nav, /\["Client Operations Demo", "\/demo\/client-operations"\]/);
});
