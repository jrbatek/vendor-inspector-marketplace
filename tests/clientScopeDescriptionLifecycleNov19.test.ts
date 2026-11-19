import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";

const client=readFileSync("app/demo/client/page.tsx","utf8");
const smoke=readFileSync("scripts/smoke-client-inspections.mjs","utf8");

test("Client Demo requirement description IDs point only to mounted elements",()=>{
  assert.match(client,/aria-describedby=\{uploadMessage \? "demo-request-limit demo-upload-status" : "demo-request-limit"\}/);
  assert.match(client,/id="demo-request-limit"/);
  assert.match(client,/\{uploadMessage&&<p id="demo-upload-status"/);
  assert.doesNotMatch(client,/aria-describedby="demo-request-limit demo-upload-status"/);
});

test("real Chromium verifies accessibility description on upload rejection and after clearing",()=>{
  assert.ok(smoke.includes("Client scope textarea refers to a nonexistent upload status"));
  assert.ok(smoke.includes("Client scope textarea must describe the visible upload rejection"));
  assert.ok(smoke.includes("Client scope textarea kept a stale aria-describedby reference"));
});
