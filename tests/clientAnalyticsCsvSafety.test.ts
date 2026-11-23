import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { buildDemoCsv } from "../lib/demoClientDataExport";

// Client Analytics must use the same defense as the other synthetic exports.
const page = readFileSync("app/demo/client-analytics/page.tsx", "utf8");

test("analytics CSV export uses the shared spreadsheet-safe serializer", () => {
  assert.match(page, /import \{ buildDemoCsv \} from ["']@\/lib\/demoClientDataExport["']/);
  assert.match(page, /const csv=buildDemoCsv\(headers,rows\)/);
  assert.doesNotMatch(page, /\[headers,\.\.\.rows\]\.map\(/);
  assert.match(page, /const rows=filtered\.map\(/);
  assert.match(page, /inspectsource-client-demo-inspections\.csv/);
});

test("CSV exported from filtered inspection rows cannot execute spreadsheet formulas", () => {
  const headers=["Project","Source Type","Spend USD"];
  const csv=buildDemoCsv(headers,[
    ["=HYPERLINK(\"https://invalid.example\")","Independent",3300],
    ["\t+SUM(1,1)","Agency",4200],
    ["Atlas \"LNG\" Project","Agency",5100]
  ]);
  assert.match(csv, /"'=HYPERLINK/);
  assert.match(csv, /"'\t\+SUM/);
  assert.match(csv, /"Atlas ""LNG"" Project"/);
  assert.equal(csv.trimEnd().split(/\r?\n/).length,4);
});

test("analytics CSV download preserves its temporary URL until the browser accepts the transfer", () => {
  assert.ok(page.includes("document.body.appendChild(a);a.click();a.remove();"));
  assert.ok(page.includes("window.setTimeout(()=>URL.revokeObjectURL(url),1000)"));
  assert.ok(!page.includes("a.click();URL.revokeObjectURL(url)"));
});
