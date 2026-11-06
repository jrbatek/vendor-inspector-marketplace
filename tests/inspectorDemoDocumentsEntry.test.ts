import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const inspector = fs.readFileSync("app/demo/inspector/page.tsx", "utf8");
const docs = fs.readFileSync("app/demo/inspector-documents/page.tsx", "utf8");

test("Inspector Demo Qualifications opens functional synthetic documentation workflow", () => {
  assert.match(inspector, /section==="qualifications"/);
  assert.match(inspector, /href="\/demo\/inspector-documents">Add Qualification &amp; Upload Documentation/);
  assert.doesNotMatch(inspector, /Document upload previewed|Preview document upload/);
  assert.match(docs, /Synthetic data|synthetic/i);
  assert.match(docs, /type="file"|type='file'/);
});

test("Inspector qualifications entry does not upload into live storage", () => {
  assert.match(inspector, /No production inspector records are used/);
  assert.doesNotMatch(inspector, /supabaseBrowser|\.from\(|\.insert\(|\.update\(|\.delete\(/);
});
