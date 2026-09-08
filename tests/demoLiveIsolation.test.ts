import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { isDemoExperiencePath } from "../lib/demoExperience";

const inspectorDemoEntry = fs.readFileSync(path.join(process.cwd(), "app/demo/inspector/page.tsx"), "utf8");
const inspectorHub = fs.readFileSync(path.join(process.cwd(), "app/inspectorhub/page.tsx"), "utf8");

test("only explicit synthetic experiences qualify for the global demo banner", () => {
  for (const route of [
    "/demo",
    "/demo/client-history",
    "/demo/client-analytics",
    "/demo/client-operations",
    "/demo/client-data",
    "/demo/inspector",
    "/demo-showcase",
    "/inspectorhub",
  ]) assert.equal(isDemoExperiencePath(route), true, route);

  for (const route of [
    "/",
    "/login",
    "/register",
    "/client-dashboard",
    "/email-requirements",
    "/what-we-do",
    "/inspection-intelligence",
  ]) assert.equal(isDemoExperiencePath(route), false, route);
});

test("Inspector Demo has a dedicated entry URL that resolves into the populated InspectorHub experience", () => {
  assert.match(inspectorDemoEntry, /redirect\("\/inspectorhub"\)/);
  assert.match(inspectorHub, /if\(!a\.user\)\{setMode\("demo"\);setItems\(DEMO_WORK\)/);
  assert.match(inspectorHub, /if\(mode!=="live"\)\{demoNotice\(\);return;\}/);
});

test("authenticated InspectorHub remains live-data scoped and separate from synthetic demo state", () => {
  assert.match(inspectorHub, /setMode\("live"\)/);
  assert.match(inspectorHub, /from\("inspector_work_activities"\)/);
  assert.match(inspectorHub, /\.eq\("inspector_id",a\.user\.id\)/);
});
