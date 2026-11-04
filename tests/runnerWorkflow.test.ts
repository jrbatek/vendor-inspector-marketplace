import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const { expectResult } = require("../.github/scripts/check-codex-socket-acl.cjs");
const workflow = fs.readFileSync(".github/workflows/inspectsource-development.yml", "utf8");

test("ACL preflight accepts only the expected permission-check result", () => {
  assert.doesNotThrow(() => expectResult({ status: 0, stderr: "" }, 0, "before ACL"));
  assert.doesNotThrow(() => expectResult({ status: 1, stderr: "" }, 1, "denied"));
  assert.throws(() => expectResult({ status: 0, stderr: "" }, 1, "denied"), /expected exit 1, got 0/);
});

test("ACL preflight fails closed on permission-check execution failures", () => {
  for (const result of [
    { status: 2, stderr: "" }, { status: null, signal: "SIGTERM" },
    { status: 1, stderr: "could not inspect socket" }, { status: null, error: new Error("missing utility") },
  ]) assert.throws(() => expectResult(result, 1, "denied"));
});

test("coding job pins the GNU-based runner and checks ACL behavior before Codex", () => {
  const codingJob = workflow.split("  develop:\n")[1].split("\n  publish:")[0];
  assert.match(codingJob, /runs-on: ubuntu-24\.04/);
  assert.ok(codingJob.indexOf("check-codex-socket-acl.cjs") < codingJob.indexOf("uses: openai/codex-action@"));
  assert.match(codingJob, /test "\$RUNNER_ENVIRONMENT" = 'github-hosted'/);
  assert.doesNotMatch(codingJob, /systemctl|\/run\/dbus|dhcpcd|safety-strategy: unsafe/);
});

test("workflow keeps recurrence disabled and Codex privilege restrictions enabled", () => {
  assert.doesNotMatch(workflow, /^  schedule:/m);
  assert.match(workflow, /safety-strategy: drop-sudo/);
  assert.match(workflow, /permission-profile: ':workspace'/);
});
