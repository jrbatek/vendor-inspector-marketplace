import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const clientDemo = fs.readFileSync(path.join(process.cwd(), "app/demo/client/page.tsx"), "utf8");
const legacyShowcase = fs.readFileSync(path.join(process.cwd(), "app/demo-showcase/page.tsx"), "utf8");

test("Client Demo is the canonical full synthetic client experience", () => {
  assert.doesNotMatch(clientDemo, /redirect\(/);
  assert.match(clientDemo, /Client Demo · Synthetic data/);
  assert.doesNotMatch(clientDemo, /createClient|supabase|insert\(|update\(|delete\(/i);
  assert.match(legacyShowcase, /redirect\("\/demo\/client"\)/);
});

test("Client Demo hub exposes the complete requested synthetic client experience", () => {
  assert.match(clientDemo, /Full client experience/);
  assert.match(clientDemo, /\/demo\/client-history/);
  assert.match(clientDemo, /\/demo\/client-analytics/);
  assert.match(clientDemo, /\/demo\/client-operations/);
  assert.match(clientDemo, /\/demo\/client-data/);
  assert.match(clientDemo, /Switch to Inspector Demo/);
  assert.match(clientDemo, /never writes synthetic records to production/);
});

test("Client Demo request intake remains aligned with the production-facing backlog wording", () => {
  assert.match(clientDemo, /Natural language request/);
  assert.match(clientDemo, /Upload Scope/);
  assert.match(clientDemo, /10,000|MAX_REQUEST_CHARS=10000/);
  assert.match(clientDemo, />Find Inspectors<\/Link>/);
  assert.match(clientDemo, /Email Requirements/);
  assert.match(clientDemo, /Structured selection/);
});
