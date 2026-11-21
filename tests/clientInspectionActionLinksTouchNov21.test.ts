import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const page = readFileSync("app/demo/client-inspections/page.tsx", "utf8");
const browser = readFileSync("scripts/smoke-client-inspections.mjs", "utf8");

test("P0-B Client Inspection action, CSV and PDF links are 44px readable targets", () => {
  for(const marker of [
    ".actionRegister .actionExport{display:inline-flex;align-items:center;min-height:44px",
    ".actionRegister td a{display:inline-flex;align-items:center;min-height:44px",
    ".exportCsv{display:inline-flex;align-items:center;min-height:44px",
    ".reportLink{display:inline-flex;align-items:center;min-height:44px"
  ]) assert.ok(page.includes(marker), marker);
  for (const marker of [".actionRegister td a:hover{background:#ccfbf1", ".actionRegister td a:focus-visible{outline:3px solid #0d9488", ".reportLink:focus-visible{outline:3px solid #2563eb"]) assert.ok(page.includes(marker), marker);
});
test("real browser measures synthetic PDF and action links alongside seven inspections", () => {
  assert.ok(browser.includes('page.locator(".actionRegister a, .resultActions a.exportCsv, .details .reportLink")'));
  assert.ok(browser.includes("inspectionLinkTargets.length >= 4"));
  assert.ok(browser.includes("inspectionLinkTargets.every(item => item.height >= 44)"));
  assert.ok(browser.includes("Client inspection action/report links below 44px"));
  assert.ok(browser.includes('Inspection details DEMO-ACT-4'));
});
