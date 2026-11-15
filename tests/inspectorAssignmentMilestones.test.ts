import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
const detail=fs.readFileSync("components/InspectorDemoAssignment.tsx","utf8");
test("three fictional assignment stages expose distinct milestone, document, site and equipment evidence",()=>{
  for(const project of ["LNG Compressor Package","Gulf Horizon Refinery Upgrade","Orion Deepwater Platform"]){
    assert.ok(detail.includes('"' + project + '": {'),project);
  }
  assert.match(detail,/const WORKFLOWS: Record<string, AssignmentWorkflow>/);
  assert.equal((detail.match(/siteContact:/g)||[]).length,4);
  assert.equal((detail.match(/equipment:/g)||[]).length,4);
  assert.equal((detail.match(/status: "Complete"/g)||[]).length,5);
  assert.match(detail,/Overdue/);
  assert.match(detail,/Awaiting update/);
  assert.match(detail,/Evidence requested/);
  assert.match(detail,/workflow\.milestones\.map/);
  assert.match(detail,/workflow\.documents\.map/);
  assert.match(detail,/Open synthetic report PDF/);
  assert.match(detail,/Outstanding items \/ next action/);
  assert.doesNotMatch(detail,/supabase|fetch\(|\.insert\(|\.update\(|\.delete\(/);
});

test("Open Assignment milestone status badges are legible and do not portray overdue as success",()=>{
  for(const label of ["complete","overdue","scheduled","upcoming"]){
    assert.ok(detail.includes('"' + label + '"'),"Missing milestone status "+label);
  }
  assert.match(detail,/milestoneStatus\.complete\{background:#dcfce7;color:#166534/);
  assert.match(detail,/milestoneStatus\.overdue\{background:#fee2e2;color:#991b1b/);
  assert.match(detail,/milestoneStatus\.scheduled\{background:#dbeafe;color:#1e40af/);
  assert.match(detail,/milestoneStatus\{display:inline-flex[^}]*background:#fef3c7;color:#92400e/);
  assert.ok(detail.includes('item.status === "Overdue" ? "overdue"'),"Overdue milestone must not appear as completed");
});
