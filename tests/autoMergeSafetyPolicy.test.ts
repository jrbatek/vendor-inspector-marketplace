import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(".github/workflows/auto-merge.yml", "utf8");

test("autonomous merge requires explicit low-risk label and exact head/base", () => {
  for (const field of ["safe-demo-auto-merge", "HEAD_SHA", "RUN_SHA", "BASE_SHA", "CURRENT_MAIN",
    "skip stale workflow", "require rebase and fresh checks", "Sensitive file or release workflow changed"]) {
    assert.ok(source.includes(field), field);
  }
  assert.match(source,/autonomous-\*/);
  assert.match(source,/--match-head-commit "\$HEAD_SHA"/);
});

test("autonomous merge requires both passed CI jobs and READY Vercel status", () => {
  for (const marker of ['.name == "validate"', '.name == "synthetic-and-app-validation"',
    '.conclusion == "success"', '.context == "Vercel"', '.state == "success"']) {
    assert.ok(source.includes(marker), marker);
  }
  assert.match(source, /if \[ "\$VALIDATE_OK" -lt 1 \] \|\| \[ "\$QA_OK" -lt 1 \]/);
  assert.match(source, /if \[ "\$VERCEL_OK" -lt 1 \]/);
  assert.ok(source.indexOf('VERCEL_OK=') < source.indexOf('gh pr merge "$PR_NUMBER"'), "Vercel check must precede merge");
});
