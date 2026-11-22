import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const source = fs.readFileSync("app/demo/inspector-affiliations/page.tsx", "utf8");

test("inspector affiliation pending claims require an explicit selected fictional claim", () => {
  assert.match(source, /const \[selectedClaim,setSelectedClaim\]=useState<string\|null>\(null\)/);
  assert.match(source, /<Cards items=\{PENDING\} selectedAgency=\{selectedClaim\} onSelect=/);
  assert.match(source, /aria-pressed=\{selectedAgency===a.agency\}/);
  assert.match(source, /disabled=\{!selectedClaim\}/);
  assert.match(source, /const claim=PENDING\.find\(row=>row\.agency===selectedClaim\)/);
  assert.match(source, /claim\.resourceId/);
  assert.match(source, /no affiliation, eligibility, or notification was changed/);
});

test("claim feedback does not leak into Current or History tabs or another pending claim", () => {
  assert.match(source, /notice&&tab==="pending"/);
  assert.match(source, /setTab\(v as typeof tab\);setNotice\(""\);setSelectedClaim\(null\)/);
  assert.match(source, /onSelect=\{agency=>\{setSelectedClaim\(agency\);setNotice\(""\)\}\}/);
});

test("claim selection, actions, and Inspector Demo back link have legible accessible states", () => {
  assert.match(source, /\.tabs button,\.actions button\{min-height:44px/);
  assert.match(source, /\.actions button:disabled\{background:#e2e8f0;color:#334155/);
  assert.match(source, /\.tabs button:focus-visible,\.actions button:focus-visible\{outline:3px solid #2563eb/);
  assert.match(source, /\.claimSelect\{min-height:44px/);
  assert.match(source, /\.claimSelect\[aria-pressed=true\]\{background:#115e59;color:#fff/);
  assert.match(source, /header a\{display:inline-flex;align-items:center;min-height:44px/);
  assert.match(source, /No production affiliation, PII, notification, eligibility or authorization changes/);
  assert.doesNotMatch(source, /supabaseBrowser|createClient\(|XMLHttpRequest/);
});
