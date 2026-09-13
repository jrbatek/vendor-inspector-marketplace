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
    "/demo/client-analytics",
    "/demo/client-history",
    "/demo/client-operations",
    "/demo/client-data",
    "/demo/inspector",
    "/email-requirements?demo=1",
  ]) {
    assert.match(workflow, new RegExp(escapeRegex(route)));
  }
});

test("production smoke protects the synthetic/live boundary instead of checking HTTP status alone", () => {
  assert.match(workflow, /grep -Fqi 'Demo Mode'/);
  assert.match(workflow, /route" == \/demo\/\*/);
  assert.match(workflow, /demo=1/);
});

test("production smoke verifies stable route-specific client and inspector experience markers", () => {
  for (const marker of [
    "Client Demo",
    "Analytics",
    "Inspection History",
    "Commercial and account management",
    "InspectSource API",
    "Inspector Demo",
    "Email Requirements",
  ]) {
    assert.match(workflow, new RegExp(escapeRegex(marker)));
  }
});
