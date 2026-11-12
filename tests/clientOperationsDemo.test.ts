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
  assert.match(page, /Approval workflow/);
  assert.match(page, /Approval history/);
  assert.match(page, /Payment history/);
  assert.match(page, /Demo reference/);
  assert.match(page, /Invoice submitted → authority check → client approval → payment status → history/);
  assert.match(page, /No payment credentials, bank data or real financial account details/);
});

test("expanded billing and contract records expose accessible detail relationships", () => {
  assert.match(page, /aria-controls=\{detailsId\}/);
  assert.match(page, /id=\{detailsId\}/);
  assert.match(page, /aria-expanded=\{openRow\}/);
  assert.match(page, /aria-hidden="true"/);
});

test("client operations expose accessible routed regions and only contract-type tabs", () => {
  assert.match(page, /role="region" id=\{embedded\?"billing-payment":"billing-panel"\} aria-label="Billing & Payment"/);
  assert.match(page, /role="region" id=\{embedded\?"contracts":"contracts-panel"\} aria-label="Contracts"/);
  assert.match(page, /role="region" id=\{embedded\?"profile":"profile-panel"\} aria-label="Client Profile"/);
  assert.match(page, /useSearchParams\(\)/);
  assert.match(page, /aria-label="Contract relationship types"/);
  assert.match(page, /aria-selected=\{contractTab===t\}/);
  assert.doesNotMatch(page, /aria-label="Client operations sections"/);
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
  assert.match(page, /Coarse suggested location/);
  assert.match(page, /Title \/ department/);
  assert.match(page, /Timezone/);
  assert.match(page, /Notifications/);
  assert.match(page, /Access level \/ roles/);
  assert.match(page, /Approval authority/);
  assert.match(page, /Account security/);
  assert.match(page, /precise geolocation is not collected/);
});

test("coarse suggested location is editable only in local synthetic demo state", () => {
  assert.match(page, /useState\("Houston, Texas, USA"\)/);
  assert.match(page, /id="coarse-location"/);
  assert.match(page, /onChange=\{\(event\)=>setCoarseLocation\(event\.target\.value\)\}/);
  assert.match(page, /City \/ region \/ country/);
  assert.match(page, /Not saved or geocoded/);
  assert.match(page, /never write to production/);
  assert.doesNotMatch(page, /navigator\.geolocation/);
  assert.doesNotMatch(page, /supabaseBrowser/);
  assert.doesNotMatch(page, /\.from\(/);
});

test("client operations demo keeps sensitive operations synthetic and non-executing", () => {
  assert.match(page, /Client Demo · Synthetic data/);
  assert.match(page, /no payment is executed/);
  assert.match(page, /No payment credentials/);
  assert.match(page, /no e-signature/i);
  assert.doesNotMatch(page, /supabaseBrowser/);
  assert.doesNotMatch(page, /\.from\(/);
});

test("client navigation exposes the operations demo", () => {
  assert.match(nav, /\["Client Operations Demo", "\/demo\/client-operations"\]/);
});

test("expired synthetic individual inspector contract must not be labeled Active", () => {
  assert.match(page, /Individual Inspector Assignment Terms",type:"Inspector assignment",status:"Expired",effective:"Aug 18, 2026",expires:"Sep 30, 2026"/);
  assert.match(page, /\.status\.Expired\{background:#fff7ed;color:#9a3412\}/);
  assert.doesNotMatch(page, /Individual Inspector Assignment Terms",type:"Inspector assignment",status:"Active"/);
  const smoke = fs.readFileSync(path.join(process.cwd(), "scripts/smoke-demo-control-visibility.mjs"), "utf8");
  assert.match(smoke, /Expired inspector contract fixture did not show its actual closeout status/);
});

test("Expired status outside parent styled-JSX scope inherits high-contrast demo-specific global CSS",()=>{
  assert.match(page, /className=\{embedded\?"shell clientOperationsDemo embedded":"shell clientOperationsDemo"\}/);
  assert.match(page, /!embedded&&<ClientWorkspaceSidebar demo\/>/);
  assert.match(page, /<style jsx global>\{\x60\.clientOperationsDemo \.status\.Expired\{background:#fff7ed;color:#9a3412\}\x60\}<\/style>/);
});
