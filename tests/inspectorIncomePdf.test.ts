import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { PDFDocument } from "pdf-lib";
import { createSyntheticIncomeReportPdf, summarizeSyntheticIncome, type SyntheticIncomeEntry } from "../lib/inspectorIncomePdf";

const rows: SyntheticIncomeEntry[] = [
  { id: "FI-26", year: 2026, client: "Fictional Energy", project: "Valve FAT", type: "Contractor", gross: 8700, paid: "2026-10-01" },
  { id: "FI-25", year: 2025, client: "Fictional Grid", project: "Transformer", type: "Employee", gross: 5300, paid: "2025-08-15" },
];
test("PDF income fixture strictly scopes totals and documents to selected fictional year", () => {
  assert.deepEqual(summarizeSyntheticIncome(rows, 2026), { selected: [rows[0]], gross: 8700, contractor: 8700, employee: 0 });
  assert.deepEqual(summarizeSyntheticIncome(rows, 2025), { selected: [rows[1]], gross: 5300, contractor: 0, employee: 5300 });
  assert.throws(() => summarizeSyntheticIncome(rows, 2027), /Unsupported demo year/);
});
test("generated synthetic income PDF is readable, labeled unverified and contains no live account data", async () => {
  const uri = await createSyntheticIncomeReportPdf(rows, 2026, "2026-11-01T23:59:59-06:00");
  assert.ok(uri.startsWith("data:application/pdf;base64,"));
  const bytes = Buffer.from(uri.split(",")[1], "base64");
  assert.equal(bytes.subarray(0, 5).toString("ascii"), "%PDF-");
  const pdf = await PDFDocument.load(bytes);
  assert.equal(pdf.getPageCount(), 1);
  assert.match(pdf.getTitle() ?? "", /FICTIONAL income report 2026/);
  assert.match(pdf.getSubject() ?? "", /UNVERIFIED SAMPLE; 2026; 1 fictional assignments/);
});
test("income PDF download stays browser-only and does not collect bank data", () => {
  const page = fs.readFileSync("app/demo/inspector-income/page.tsx", "utf8");
  const helper = fs.readFileSync("lib/inspectorIncomePdf.ts", "utf8");
  assert.match(page, /downloadSyntheticPdf/);
  assert.match(page, /download="inspectsource-synthetic-income-report-/);
  assert.match(page, /Download synthetic income report PDF/);
  assert.match(page, /PDF preview is marked SAMPLE/);
  assert.match(helper, /pdf.saveAsBase64\(\{ dataUri: true \}\)/);
  assert.doesNotMatch(helper, /fetch\(|supabase|https?:\/\//);
});
