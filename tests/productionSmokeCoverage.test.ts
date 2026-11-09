import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const workflow = fs.readFileSync(
  path.join(process.cwd(), ".github/workflows/production-smoke.yml"),
  "utf8",
);

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

test("production smoke continuously covers the complete synthetic client and inspector demo surfaces", () => {
  for (const route of [
    "/demo/client",
    "/demo/client-inspections",
    "/demo/inspector-work-history",
    "/demo/client-analytics",
    "/demo/client-history",
    "/demo/client-operations",
    "/demo/client-data",
    "/demo/inspector",
    "/demo/inspector-selection-outcomes",
    "/demo/inspector-documents",
    "/demo/inspector-income",
    "/email-requirements?demo=1",
  ]) {
    assert.match(workflow, new RegExp(escapeRegex(route)));
  }
});

test("production smoke protects server-rendered demo boundaries without misreading hydrated query state", () => {
  assert.match(workflow, /grep -Fqi 'Demo Mode'/);
  assert.match(workflow, /route" == \/demo\/\*/);
  assert.doesNotMatch(workflow, /route" == \/demo\/\* \|\| "\$route" == \*"demo=1"\*/);
});

test("production smoke verifies stable route-specific client and inspector experience markers", () => {
  for (const marker of [
    "Client Demo",
    "Inspections in Progress",
    "Choose how to source inspectors",
    "Client contracts",
    "Work History",
    "Analytics",
    "Inspection History",
    "Commercial and account management",
    "InspectSource API",
    "Inspector Demo",
    "Selection Insights",
    "Qualification Documents",
    "Assignment earnings",
    "Email Requirements",
  ]) {
    assert.match(workflow, new RegExp(escapeRegex(marker)));
  }
});

test("production smoke uses stable rendered client/agency headings, not stale or HTML-escaped markers",()=>{
  assert.doesNotMatch(workflow,/Contracted Agency Sourcing/);
  assert.doesNotMatch(workflow,/Contracts, Commercials & Analytics/);
  assert.match(workflow,/Choose how to source inspectors/);
  assert.match(workflow,/Client contracts/);
  assert.match(workflow,/Inspections in Progress/);
  assert.match(workflow,/Work History/);
});

test("production smoke also checks synthetic Inspector financial, qualifications and insights entry routes",()=>{
 for(const route of ["/demo/inspector-income","/demo/inspector-documents","/demo/inspector-selection-outcomes"])
  assert.ok(workflow.includes('"' + route + '"'),route);
});

test("dispatch smoke refuses an unexpected merged-main SHA and preserves legacy push tests",()=>{
 assert.match(workflow,/workflow_dispatch:/);
 assert.match(workflow,/expected_sha:/);
 assert.match(workflow,/EXPECTED_SHA:.*inputs\.expected_sha/);
 assert.match(workflow,/GITHUB_SHA.*EXPECTED_SHA/);
 assert.match(workflow,/\[a-f0-9\]\{40\}/);
 assert.match(workflow,/branches: \[main\]/);
});
