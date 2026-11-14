import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const page = readFileSync("app/demo/agency/page.tsx", "utf8");
const browser = readFileSync("scripts/smoke-agency-scrollspy.mjs", "utf8");

test("Agency CSV audit can be cleared explicitly without uploading or retaining preview", () => {
  assert.match(page, /const \[rosterCleared,setRosterCleared\]=useState\(false\)/);
  assert.match(page, /setRosterPreview\(null\);setRosterError\(""\);setRosterCleared\(true\)/);
  assert.match(page, /Clear browser-local roster preview/);
  assert.match(page, /Roster preview cleared from this browser session/);
  assert.match(page, /\.rosterClear:hover\{background:#ede9fe;color:#4c1d95/);
  assert.match(page, /\.rosterClear:focus-visible\{outline:3px solid #7c3aed/);
  assert.doesNotMatch(page, /fetch\(.*roster|supabaseBrowser/);
});

test("Hosted Chromium clears old CSV counts and accepts another same-name fictional file", () => {
  for (const marker of [
    "Agency Clear roster preview retained old CSV counts or validation breakdown",
    "Agency Clear roster preview did not announce browser-local clearance",
    "Agency new CSV upload did not replace cleared preview and reset clearance notice"
  ]) assert.ok(browser.includes(marker), marker);
});
