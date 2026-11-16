import assert from "node:assert/strict";
import test from "node:test";
import { adjacentDemoAssignmentDate } from "../lib/demoAssignmentNavigation";

const assigned = [
  {date:"2026-11-09",state:"Assigned",project:"Gulf Horizon"},
  {date:"2026-11-10",state:"Assigned",project:"Gulf Horizon"},
  {date:"2026-11-12",state:"Assigned",project:"LNG Compressor"},
  {date:"2026-11-13",state:"Assigned",project:"LNG Compressor"},
  {date:"2026-11-20",state:"Busy"},
  {date:"2026-11-26",state:"Assigned",project:"Orion"},
  {date:"2026-11-27",state:"Assigned",project:"Orion"},
  {date:"2026-11-30",state:"Tentative / Hold"},
];

test("Next and Previous assignment skip duplicate days of the current project",()=>{
  assert.equal(adjacentDemoAssignmentDate(assigned,"2026-11-09","next"),"2026-11-12");
  assert.equal(adjacentDemoAssignmentDate(assigned,"2026-11-10","next"),"2026-11-12");
  assert.equal(adjacentDemoAssignmentDate(assigned,"2026-11-12","next"),"2026-11-26");
  assert.equal(adjacentDemoAssignmentDate(assigned,"2026-11-13","previous"),"2026-11-09");
  assert.equal(adjacentDemoAssignmentDate(assigned,"2026-11-26","previous"),"2026-11-12");
  assert.equal(adjacentDemoAssignmentDate(assigned,"2026-11-27","previous"),"2026-11-12");
});
test("Navigation from an unassigned day reaches nearest distinct project start",()=>{
  assert.equal(adjacentDemoAssignmentDate(assigned,"2026-11-11","next"),"2026-11-12");
  assert.equal(adjacentDemoAssignmentDate(assigned,"2026-11-11","previous"),"2026-11-09");
  assert.equal(adjacentDemoAssignmentDate(assigned,"2026-11-25","next"),"2026-11-26");
  assert.equal(adjacentDemoAssignmentDate(assigned,"2026-12-01","previous"),"2026-11-26");
});
test("No wraparound or invented assignments; non-assigned entries are ignored",()=>{
  assert.equal(adjacentDemoAssignmentDate(assigned,"2026-11-09","previous"),undefined);
  assert.equal(adjacentDemoAssignmentDate(assigned,"2026-11-27","next"),undefined);
  assert.equal(adjacentDemoAssignmentDate([{date:"2026-11-10",state:"Busy"}],"2026-11-09","next"),undefined);
});
