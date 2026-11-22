import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync("app/demo/client-operations/page.tsx", "utf8");

test("collapsed Client Demo invoices and contracts do not point aria-controls to absent detail elements", () => {
  const controlledDisclosure = Array.from(source.matchAll(/aria-expanded=\{openRow\} aria-controls=\{openRow\?detailsId:undefined\}/g));
  assert.equal(controlledDisclosure.length, 2, "Both invoice and contract disclosures must use conditional references");
  assert.match(source, /\{openRow&&<div className="details billingDetails" id=\{detailsId\}>/);
  assert.match(source, /\{openRow&&<div className="contractDetails" id=\{detailsId\}>/);
  assert.doesNotMatch(source, /aria-expanded=\{openRow\} aria-controls=\{detailsId\}/);
});

test("inactive Contracts relationship tabs do not target an unmounted tabpanel", () => {
  assert.match(source, /aria-controls=\{contractTab===t\?panelId:undefined\} aria-selected=\{contractTab===t\}/);
  assert.match(source, /role="tabpanel" id=\{`contract-panel-\$\{contractTab\.replaceAll/);
  assert.match(source, /handleTabKeyboard/);
});

test("synthetic-only Billing, Contracts and Profile remain available without live financial or account changes", () => {
  assert.match(source, /Fictional records only\. This demo never requires login or writes to production/);
  assert.match(source, /No payment credentials, bank data or real financial account details/);
  assert.match(source, /No e-signature, legal acceptance or production contract mutation/);
});
