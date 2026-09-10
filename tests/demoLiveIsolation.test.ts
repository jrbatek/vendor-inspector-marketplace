import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { isDemoExperiencePath } from "../lib/demoExperience";

const inspectorDemoEntry = fs.readFileSync(path.join(process.cwd(), "app/demo/inspector/page.tsx"), "utf8");
const inspectorHub = fs.readFileSync(path.join(process.cwd(), "app/inspectorhub/page.tsx"), "utf8");
const findInspectors = fs.readFileSync(path.join(process.cwd(), "app/find-inspectors/page.tsx"), "utf8");

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

test("Inspector Demo is a standalone synthetic experience isolated from production inspector data", () => {
  assert.match(inspectorDemoEntry, /Inspector Demo · Synthetic data/);
  assert.match(inspectorDemoEntry, /No production inspector data or database tables are used/);
  assert.match(inspectorDemoEntry, /PROFILES/);
  assert.doesNotMatch(inspectorDemoEntry, /supabaseBrowser|\.from\(|\.insert\(|\.update\(|\.delete\(/);
});

test("unauthenticated InspectorHub remains a populated synthetic preview with writes blocked", () => {
  assert.match(inspectorHub, /if\(!a\.user\)\{setMode\("demo"\);setItems\(DEMO_WORK\)/);
  assert.match(inspectorHub, /if\(mode!=="live"\)\{demoNotice\(\);return;\}/);
});

test("authenticated InspectorHub remains live-data scoped and separate from synthetic demo state", () => {
  assert.match(inspectorHub, /setMode\("live"\)/);
  assert.match(inspectorHub, /from\("inspector_work_activities"\)/);
  assert.match(inspectorHub, /\.eq\("inspector_id",a\.user\.id\)/);
});

test("public Find Inspectors search does not persist request text without an authenticated client", () => {
  assert.match(findInspectors, /const \{ data: auth \} = await supabase\.auth\.getUser\(\);[\s\S]*if \(auth\.user\) \{[\s\S]*await supabase\.from\("client_search_requests"\)\.insert\(\{ client_id: auth\.user\.id,/);
  assert.doesNotMatch(findInspectors, /client_id:\s*auth\.user\?\.id\s*\|\|\s*null/);
});
