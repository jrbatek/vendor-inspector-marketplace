import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const naturalLanguage = fs.readFileSync(path.join(process.cwd(), "app/find-inspectors/page.tsx"), "utf8");
const emailRequirements = fs.readFileSync(path.join(process.cwd(), "app/email-requirements/page.tsx"), "utf8");
const sidebar = fs.readFileSync(path.join(process.cwd(), "components/ClientWorkspaceSidebar.tsx"), "utf8");

test("natural-language intake uses the requested client-facing wording", () => {
  assert.match(naturalLanguage, /Upload Scope/);
  assert.match(naturalLanguage, /"Find Inspectors"/);
  assert.doesNotMatch(naturalLanguage, /Find Qualified Inspectors/);
  assert.doesNotMatch(naturalLanguage, /Add scope text file/);
});

test("natural-language intake clearly enforces a 10,000 character limit", () => {
  assert.match(naturalLanguage, /MAX_REQUEST_CHARS = 10000/);
  assert.match(naturalLanguage, /maxLength=\{MAX_REQUEST_CHARS\}/);
  assert.match(naturalLanguage, /Up to \{MAX_REQUEST_CHARS\.toLocaleString\(\)\} characters/);
  assert.match(naturalLanguage, /slice\(0, MAX_REQUEST_CHARS\)/);
});

test("upload scope control includes a visible icon and supported text formats", () => {
  assert.match(naturalLanguage, /className="uploadIcon"/);
  assert.match(naturalLanguage, /accept="\.txt,\.md,\.csv,\.json"/);
});

test("email requirements opens a guidance page before email", () => {
  assert.match(sidebar, /href="\/email-requirements">Email requirements/);
  assert.doesNotMatch(sidebar, /mailto:inspectsource2026@gmail\.com/);
  assert.match(emailRequirements, /Copy-ready example/);
  assert.match(emailRequirements, /If you write your own/);
  assert.match(emailRequirements, /Preferred file types:/);
  assert.match(emailRequirements, /20 MB or less/);
});

test("email subject identifies InspectSource", () => {
  assert.match(emailRequirements, /InspectSource%20-%20Inspection%20Request/);
  assert.match(emailRequirements, /Subject: <strong>InspectSource - Inspection Request<\/strong>/);
});
