import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { exportAgencyDemoReportsCsv, type AgencyDemoReport } from "../lib/agencyDemoReports";

const page = readFileSync("app/demo/agency/page.tsx", "utf8");
const browser = readFileSync("scripts/smoke-agency-capacity.mjs", "utf8");

test("Agency Reports & NCRs export is selected-only, synthetic, formula-safe and handles quoted text", () => {
  const sample: AgencyDemoReport[] = [
    { inspection: "Qatar compression package", inspector: "Omar Haddad", source: "Northstar · Subcontractor", report: "Submitted", finding: "NCR-204 · Open", findingStatus: "Open", next: "Supplier response due" },
    { inspection: "=DANGEROUS", inspector: "Inspector \"Quoted\"", source: "Northstar", report: "Draft", finding: "NCR-198", findingStatus: "Follow-up", next: "@external" },
  ];
  const csv = exportAgencyDemoReportsCsv(sample.slice(0, 1));
  assert.ok(csv.startsWith("\uFEFF"));
  assert.equal(csv.trimEnd().split("\r\n").length, 2);
  assert.match(csv, /SYNTHETIC - NOT VERIFIED/);
  assert.match(csv, /NCR-204/);
  assert.doesNotMatch(csv, /NCR-198/);
  const untrusted = exportAgencyDemoReportsCsv(sample.slice(1));
  assert.ok(untrusted.includes('"\'=DANGEROUS"'));
  assert.ok(untrusted.includes('"Inspector ""Quoted"""'));
  assert.ok(untrusted.includes('"\'@external"'));
});

test("Agency report CSV link follows the live fictional NCR filter with accessible visible focus", () => {
  assert.match(page, /exportAgencyDemoReportsCsv\(visibleSampleReports\)/);
  assert.match(page, /download="inspectsource-synthetic-agency-reports-ncrs.csv"/);
  assert.match(page, /aria-label=\{`Download \$\{visibleSampleReports.length\} filtered synthetic agency report and NCR examples as CSV`\}/);
  assert.match(page, /visibleSampleReports.length > 0 && <a className="reportDownload"/);
  assert.match(page, /\.reportTools a\.reportDownload:focus-visible\{outline:3px/);
  assert.match(browser, /ncrDownloadWait=page.waitForEvent\("download"\)/);
  assert.match(browser, /reportCsv\.includes\("NCR-204"\)/);
  assert.match(browser, /reportCsv\.includes\("NCR-198"\)/);
  assert.doesNotMatch(page, /supabaseBrowser|createClient|process\.env/);
});
