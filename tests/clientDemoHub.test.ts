import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const entry = fs.readFileSync(path.join(process.cwd(), "app/demo/client/page.tsx"), "utf8");
const showcase = fs.readFileSync(path.join(process.cwd(), "app/demo-showcase/page.tsx"), "utf8");

test("Client Demo has a dedicated entry that reuses the existing synthetic client architecture", () => {
  assert.match(entry, /redirect\("\/demo-showcase"\)/);
  assert.doesNotMatch(entry, /createClient|supabase|insert\(|update\(|delete\(/i);
});

test("Client Demo hub exposes the complete requested synthetic client experience", () => {
  assert.match(showcase, /Full client experience/);
  assert.match(showcase, /\/demo\/client-history/);
  assert.match(showcase, /\/demo\/client-analytics/);
  assert.match(showcase, /\/demo\/client-operations/);
  assert.match(showcase, /\/demo\/client-data/);
  assert.match(showcase, /Switch to Inspector Demo/);
  assert.match(showcase, /never writes synthetic records to production/);
});

test("Client Demo request intake remains aligned with the production-facing backlog wording", () => {
  assert.match(showcase, /Natural language request/);
  assert.match(showcase, /Upload Scope/);
  assert.match(showcase, /10,000|MAX_REQUEST_CHARS=10000/);
  assert.match(showcase, />Find Inspectors<\/Link>/);
  assert.match(showcase, /Email Requirements/);
  assert.match(showcase, /Structured selection/);
});
