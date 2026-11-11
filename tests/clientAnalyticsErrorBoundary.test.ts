import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const content = fs.readFileSync("app/demo/client-analytics/error.tsx","utf8");

test("Client Analytics exceptions show a safe accessible recovery instead of a dead application shell",()=>{
  assert.match(content,/"use client"/);
  assert.match(content,/Analytics view could not load/);
  assert.match(content,/onClick=\{\(\) => reset\(\)\}/);
  assert.match(content,/aria-labelledby="analytics-recovery-title"/);
  assert.match(content,/Try analytics again/);
  assert.match(content,/focus-visible/);
  assert.match(content,/fictional inspections only/);
});

test("Client Analytics recovery never navigates a reviewer into authenticated live workspace",()=>{
  for(const path of ["/demo/client-analytics","/demo/client-inspections","/demo/client"]){
    assert.ok(content.includes('href="'+path+'"'));
  }
  assert.doesNotMatch(content,/href="\/client-dashboard|href="\/login/);
});

test("client-only Analytics recovery offers bounded, copyable synthetic crash diagnostics without sending telemetry",()=>{
  assert.match(content,/const diagnostic = \[/);
  assert.match(content,/error\.message/);
  assert.match(content,/error\.stack/);
  assert.match(content,/error\.digest/);
  assert.match(content,/\.slice\(0, 6000\)/);
  assert.match(content,/<details className="diagnostics">/);
  assert.match(content,/<pre>\{diagnostic\}<\/pre>/);
  assert.match(content,/No account data is accessed and no error information is submitted automatically/);
  assert.doesNotMatch(content,/navigator\.sendBeacon|fetch\(|\.insert\(|\.update\(|\/client-dashboard/);
});


test("Analytics exception recovery preserves Client Demo two-column shell and mobile navigation",()=>{
  assert.match(content,/import ClientWorkspaceSidebar from "@\/components\/ClientWorkspaceSidebar"/);
  assert.match(content,/<ClientWorkspaceSidebar demo\s*\/>/);
  assert.match(content,/grid-template-columns:250px minmax\(0,1fr\)/);
  assert.match(content,/@media\(max-width:980px\)\{\.analyticsRecovery\{grid-template-columns:1fr\}\}/);
  assert.match(content,/Technical details for troubleshooting/);
  assert.doesNotMatch(content,/href="\/client-dashboard|href="\/login/);
});
