import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const inspectorHub = fs.readFileSync(path.join(process.cwd(), "app/inspectorhub/page.tsx"), "utf8");

test("unauthenticated InspectorHub uses synthetic demo records instead of live account data", () => {
  assert.match(inspectorHub, /const DEMO_WORK:Work\[\]=\[/);
  assert.match(inspectorHub, /if\(!a\.user\)\{setMode\("demo"\);setItems\(DEMO_WORK\)/);
  assert.match(inspectorHub, /Demo Mode · Synthetic data/);
  assert.match(inspectorHub, /deterministic synthetic data/);
});

test("inspector demo covers the end-to-end professional workspace", () => {
  for (const label of [
    "Matched inspection opportunities",
    "Active assignments",
    "Schedule & availability",
    "Selection Insights",
    "Client feedback",
    "Document center",
    "Reports & billing",
    "My Work History",
  ]) assert.match(inspectorHub, new RegExp(label.replace(/[&]/g, "&")));
  assert.match(inspectorHub, /DEMO_OPPORTUNITIES/);
  assert.match(inspectorHub, /DEMO_ASSIGNMENTS/);
  assert.match(inspectorHub, /DEMO_DOCUMENTS/);
  assert.match(inspectorHub, /Insights never expose competing inspector identities/);
});

test("demo InspectorHub blocks writes while keeping controls visible", () => {
  assert.match(inspectorHub, /if\(mode!=="live"\)\{demoNotice\(\);return;\}/);
  assert.match(inspectorHub, /Preview Add Activity/);
  assert.match(inspectorHub, /Preview Upload CSV/);
  assert.match(inspectorHub, /does not write to a live account/);
  assert.match(inspectorHub, /No payment execution, tax filing, bank credentials or compensation rules are changed here/);
});

test("authenticated InspectorHub still loads live inspector-scoped records", () => {
  assert.match(inspectorHub, /setMode\("live"\)/);
  assert.match(inspectorHub, /from\("inspector_work_activities"\)/);
  assert.match(inspectorHub, /\.eq\("inspector_id",a\.user\.id\)/);
});
