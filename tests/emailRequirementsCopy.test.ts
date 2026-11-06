import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const source = fs.readFileSync("app/email-requirements/page.tsx", "utf8");

test("email requirements provide recipient and turnaround in the top section", () => {
  assert.match(source, /mailto:inspectsource2026@gmail\.com\?subject=/);
  assert.match(source, /Send your inspection request to <a href=\{mailto\}>inspectsource2026@gmail\.com<\/a>/);
  assert.match(source, /A typical response takes about five minutes\. Only available inspectors are returned\./);
  assert.match(source, /same request used by the Natural Language and Structured Selection selection/);
});

test("email requirements omit redundant bottom callout and keep top email action", () => {
  assert.doesNotMatch(source, /footerCallout|<strong>Ready\?<\/strong>|Your email client will open with/);
  assert.equal((source.match(/<a className="emailButton" href=\{mailto\}>Open Email<\/a>/g) || []).length, 1);
  assert.match(source, /export default function EmailRequirementsPage/);
});
