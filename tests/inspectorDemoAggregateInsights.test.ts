import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const source = fs.readFileSync("app/demo/inspector/page.tsx", "utf8");

test("Inspector Demo insights entry points expose aggregate peers without individual selection outcomes", () => {
  assert.match(source, /4\.9 \/ 5 · Peer insights/);
  assert.match(source, /No individual selection outcomes, named selections, or client decisions are shown/);
  assert.match(source, /href="\/demo\/inspector-selection-outcomes"/);
  assert.match(source, /Ratings detail/);
  assert.doesNotMatch(source, /Selected · Gulf Horizon|Shortlisted · North Sea Aurora|2 selected · 1 shortlisted/);
});

test("Inspector Demo selection insights do not make real data requests", () => {
  assert.match(source, /deterministic synthetic demo content/);
  assert.match(source, /No production inspector records are used/);
  assert.doesNotMatch(source, /supabaseBrowser|\.from\(|\.insert\(|\.update\(|\.delete\(/);
  assert.ok(fs.existsSync("app/demo/inspector-selection-outcomes/page.tsx"));
});
