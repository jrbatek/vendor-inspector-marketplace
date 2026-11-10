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
