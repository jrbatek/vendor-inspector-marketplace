import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

// File inputs must stay in the keyboard tab order; display:none removes them.
const client = fs.readFileSync("app/find-inspectors/page.tsx", "utf8");
const inspector = fs.readFileSync("app/inspectorhub/page.tsx", "utf8");
const visuallyHidden = /position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect\(0,0,0,0\);white-space:nowrap;border:0/;

test("live Client Upload Scope can receive keyboard focus while its visible label shows the focus ring", () => {
  assert.match(client, /<label className="fileButton">[\s\S]*?<input type="file" accept="\.txt,\.md,\.csv,\.json"/);
  assert.match(client, /\.fileButton:focus-within\{outline:3px solid #0d9488;outline-offset:3px;background:#f0fdfa\}/);
  assert.match(client, /\.fileButton:hover\{background:#f0fdfa;color:#115e59;border-color:#0f766e\}/);
  assert.ok(visuallyHidden.test(client), "File input must be visually hidden, not removed from tab order");
  assert.doesNotMatch(client, /\.fileButton input\{display:none\}/);
});

test("live InspectorHub CSV uploader stays keyboard operable with a visible focus indicator", () => {
  assert.match(inspector, /<label className="upload">[\s\S]*?<input type="file" accept="\.csv,text\/csv"/);
  assert.match(inspector, /\.upload:focus-within\{outline:3px solid #5eead4;outline-offset:2px\}/);
  assert.match(inspector, /\.upload:hover\{background:#115e59;color:#fff\}/);
  assert.ok(visuallyHidden.test(inspector), "CSV file input must stay focusable");
  assert.doesNotMatch(inspector, /\.upload input\{display:none\}/);
});

test("live uploads are styling-only changes and retain the original file-format boundaries", () => {
  assert.match(client, /accept="\.txt,\.md,\.csv,\.json"/);
  assert.match(inspector, /accept="\.csv,text\/csv"/);
});
