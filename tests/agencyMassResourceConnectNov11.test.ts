import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";
const source=readFileSync("app/demo/agency/page.tsx","utf8");
const browser=readFileSync("scripts/smoke-agency-scrollspy.mjs","utf8");
test("Agency Mass Resource Connect stays in one-page sidebar with fictional dry-run-only API setup",()=>{
  assert.match(source,/"Mass Resource Connect"/);
  assert.match(source,/id="mass-resource-connect"/);
  assert.doesNotMatch(source,/id="bulk-upload"|"Bulk Upload"|Bulk Resource Upload/);
  assert.match(source,/aria-controls="agency-api-connection-guide"/);
  assert.match(source,/aria-expanded={apiGuideOpen}/);
  assert.match(source,/setApiPreview\(true\)/);
  assert.match(source,/0 records submitted/);
  assert.match(source,/does not collect personal details|no production systems are contacted/i);
  assert.match(source,/download="inspectsource-agency-synthetic-roster.csv"/);
  assert.match(browser,/Dry run complete/);
  assert.match(browser,/selectOption\("Agency HRIS"\)/);
});
