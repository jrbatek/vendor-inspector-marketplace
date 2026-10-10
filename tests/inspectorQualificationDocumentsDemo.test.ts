import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const source = fs.readFileSync(path.join(process.cwd(), "app/demo/inspector-documents/page.tsx"), "utf8");

test("qualification documents use only explicit synthetic evidence", () => {
  assert.match(source, /INSPECTSOURCE SYNTHETIC DEMO/);
  assert.match(source, /not a real credential/);
  assert.match(source, /no production certificates or personal data are used/);
  assert.doesNotMatch(source, /supabaseBrowser|\.from\(|storage\.from|fetch\(/);
});

test("qualification documents provide working certificate preview controls", () => {
  assert.match(source, /View certificate/);
  assert.match(source, /role="dialog"/);
  assert.match(source, /aria-modal="true"/);
  assert.match(source, /Close certificate preview/);
  assert.match(source, /\{selected\.format\} preview/);
  assert.match(source, /format: "PDF"/);
  assert.match(source, /format: "Image"/);
});

test("qualification document sharing stays permission-gated and non-production", () => {
  assert.match(source, /Share securely/);
  assert.match(source, /authorized client/);
  assert.match(source, /authorized agency/);
  assert.match(source, /verify inspector ownership, recipient authorization/);
  assert.match(source, /No public link is created/);
  assert.match(source, /does not perform a production share/);
});

test("qualification document controls protect visible interactive states", () => {
  assert.match(source, /button:hover\{background:/);
  assert.match(source, /button:focus-visible\{outline:/);
  assert.match(source, /\.secondary,.close\{background:#fff;color:/);
  assert.match(source, /\.secondary:hover,.close:hover\{background:/);
});
