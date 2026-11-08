import test from "node:test";
import assert from "node:assert/strict";
import { buildDemoCsv, buildDemoJson, safeDemoCsvCell } from "../lib/demoClientDataExport";

test("CSV exports quote fields, escape quotes, and defang spreadsheet formulas", () => {
  const q = '"';
  assert.equal(safeDemoCsvCell("=2+2"), q + "'=2+2" + q);
  assert.equal(safeDemoCsvCell("  @IMPORT"), q + "'  @IMPORT" + q);
  assert.equal(safeDemoCsvCell('Sample "project"'), q + 'Sample ""project""' + q);
  assert.equal(safeDemoCsvCell("Atlas LNG"), q + "Atlas LNG" + q);
  const csv = buildDemoCsv(["Project","Spend"],[["Project A",4000],["+CMD",125]]);
  assert.ok(csv.includes(q + "'+CMD" + q));
  assert.ok(csv.includes(q + "Project A" + q + "," + q + "4000" + q));
  assert.throws(()=>buildDemoCsv(["a","b"],[["one"]]),/header length/);
});

test("JSON demo export is explicitly synthetic, complete, and not live", () => {
  const data=[{inspection:"IS-10428",spend:4820},{inspection:"IS-10451",spend:6150}];
  const parsed=JSON.parse(buildDemoJson(data));
  assert.equal(parsed.dataset,"SYNTHETIC DEMO - NOT VERIFIED");
  assert.equal(parsed.liveIntegration,false);
  assert.equal(parsed.count,2);
  assert.deepEqual(parsed.inspections,data);
});
