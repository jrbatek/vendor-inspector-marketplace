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
