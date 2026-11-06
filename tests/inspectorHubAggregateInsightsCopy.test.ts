import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const hub = fs.readFileSync("app/inspectorhub/page.tsx", "utf8");

test("InspectorHub synthetic insights explain peers, never specific selection outcomes", () => {
  assert.match(hub, /How your profile compares with peers/);
  assert.match(hub, /Synthetic profile strengths:/);
  assert.match(hub, /These are not individual client selection reasons/);
  assert.match(hub, /No individual selection outcomes or client decisions are shown/);
  assert.match(hub, /href="\/demo\/inspector-selection-outcomes"/);
  assert.doesNotMatch(hub, /Why clients are selecting you/);
});

test("InspectorHub retains demo-vs-live data boundary and existing authorizations", () => {
  assert.match(hub, /if\(!a\.user\)\{setMode\("demo"\);setItems\(DEMO_WORK\)/);
  assert.match(hub, /from\("inspector_work_activities"\)/);
  assert.match(hub, /\.eq\("inspector_id",a\.user\.id\)/);
});
