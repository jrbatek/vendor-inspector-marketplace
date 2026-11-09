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
  assert.match(source, /workflows: \["Validate application", "Autonomous QA"\]/);
  for (const marker of ['.name == "validate"', '.name == "synthetic-and-app-validation"',
    '.conclusion == "success"', '.context == "Vercel"', '.state == "success"']) {
    assert.ok(source.includes(marker), marker);
  }
  assert.match(source, /if \[ "\$VALIDATE_OK" -lt 1 \] \|\| \[ "\$QA_OK" -lt 1 \]/);
  assert.match(source, /if \[ "\$VERCEL_OK" -lt 1 \]/);
  assert.ok(source.indexOf('VERCEL_OK=') < source.indexOf('gh pr merge "$PR_NUMBER"'), "Vercel check must precede merge");
});

test("GitHub-token auto merges explicitly dispatch a commit-pinned production smoke only after merged Vercel READY",()=>{
 assert.match(source,/actions: write/);
 assert.match(source,/MERGED_SHA=.*merge_commit_sha/);
 assert.match(source,/CURRENT_MAIN.*MERGED_SHA/);
 assert.match(source,/VERCEL_PRODUCTION/);
 assert.match(source,/PRODUCTION_READY.*true/);
 assert.match(source,/production-smoke\.yml\/dispatches/);
 assert.match(source,/inputs\[expected_sha\]/);
 assert.ok(source.indexOf('gh pr merge "$PR_NUMBER"') < source.indexOf('production-smoke.yml/dispatches'));
 assert.ok(source.indexOf('if [ "$PRODUCTION_READY" != true ]') < source.indexOf('production-smoke.yml/dispatches'));
});
