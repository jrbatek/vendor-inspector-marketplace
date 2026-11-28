import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync("app/demo/inspector-documents/page.tsx", "utf8");
test("choosing recommended evidence clears stale feedback without clearing the draft", () => {
  const handler = source.match(/onClick=\{\(\) => \{ ([^\n]*?) \}\}>Add evidence for/);
  assert.ok(handler);
  assert.ok(handler[1].includes('setFormError(""); setNotice(""); setQualificationId(item.id);'));
  assert.ok(handler[1].includes('querySelector("select")?.focus()'));
  assert.doesNotMatch(handler[1], /setIssued\(|setExpires\(|setFile\(/);
});
