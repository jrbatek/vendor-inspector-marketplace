import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const page = readFileSync("app/demo/client/page.tsx", "utf8");
const smoke = readFileSync("scripts/smoke-client-inspections.mjs", "utf8");

test("Client Structured Selection can reset all five criteria without submitting any real request",()=>{
  assert.match(page,/const DEFAULT_CRITERIA=\{region:"Gulf Coast",qualification:"API 570",start:"2026-11-16",experience:"5",source:"Both"\}/);
  assert.ok(page.includes("Reset criteria"));
  assert.ok(page.includes('setCriteria({...DEFAULT_CRITERIA});setCriteriaPreview("");'));
  assert.ok(page.includes('type="button" className="resetCriteria"'));
  assert.ok(page.includes(".resetCriteria:focus-visible"));
  assert.ok(page.includes(".resetCriteria:hover"));
  assert.ok(page.includes(".resetCriteria:disabled"));
  assert.doesNotMatch(page,/supabaseBrowser|createClient|\.insert\(/i);
});
test("real Chromium verifies reset and a fresh preview, while the Client Demo remains public",()=>{
  assert.ok(smoke.includes("Reset criteria must restore all five fictional Structured Selection defaults"));
  assert.ok(smoke.includes("Reset criteria must clear outdated synthetic previews"));
  assert.ok(smoke.includes("Preview after Reset criteria must reflect defaults"));
});
