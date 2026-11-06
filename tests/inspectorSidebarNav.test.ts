import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const src = fs.readFileSync("app/demo/inspector/page.tsx", "utf8");

test("InspectorHub green sidebar renders clean text links rather than rounded nav buttons", () => {
  assert.match(src, /\.side button\{[^}]*background:transparent;[^}]*border-radius:0;/);
  assert.match(src, /\.side button\.active\{background:transparent;color:#99f6e4;border-left-color:#5eead4;/);
  assert.match(src, /\.side button:hover\{background:transparent;color:#fff;text-decoration:underline;/);
  assert.match(src, /\.side button:focus-visible\{outline:3px solid #5eead4;/);
  assert.doesNotMatch(src, /\.side button\.active\{background:#(?:0f172a|ccfbf1)/);
});
