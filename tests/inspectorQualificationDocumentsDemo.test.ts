import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const source = fs.readFileSync(path.join(process.cwd(), "app/demo/inspector-documents/page.tsx"), "utf8");

test("qualification documents use only explicit synthetic evidence", () => {
  assert.match(source, /INSPECTSOURCE SYNTHETIC DEMO/);
  assert.match(source, /not a real credential/);
  assert.match(source, /no production certificates or personal data are used/);
  assert.doesNotMatch(source, /supabaseBrowser|supabase\.from\(|storage\.from|fetch\(/);
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

test("sample evidence remains browser-local and pending verification", () => {
  assert.match(source, /Add Qualification &amp; Upload Documentation/);
  assert.match(source, /validateQualificationDraft/);
  assert.match(source, /validateSampleFile/);
  assert.match(source, /status: "Pending verification"/);
  assert.match(source, /verified: false/);
  assert.match(source, /URL\.createObjectURL/);
  assert.match(source, /URL\.revokeObjectURL/);
  assert.match(source, /Remove local sample/);
  assert.match(source, /cleared on refresh/);
  assert.doesNotMatch(source, /localStorage|indexedDB|fetch\(|XMLHttpRequest/);
});

test("qualification discovery has context controls official sources and accessible dialog dismissal", () => {
  assert.match(source, /Recommended Additional Qualifications/);
  assert.match(source, /aria-label="Demand region"/);
  assert.match(source, /aria-label="Profile focus"/);
  assert.match(source, /href=\{item.requirementsUrl\}/);
  assert.match(source, /not eligibility findings/);
  assert.match(source, /event.key === "Escape"/);
  assert.match(source, /event.key !== "Tab"/);
  assert.match(source, /previous\?\.focus\(\)/);
});
