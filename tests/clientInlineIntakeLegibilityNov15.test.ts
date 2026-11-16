import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source=readFileSync("app/demo/client/page.tsx","utf8");
const smoke=readFileSync("scripts/smoke-client-inspections.mjs","utf8");

test("Client request textarea has explicit readable colors and accessible hover/focus/disabled styles",()=>{
  assert.match(source,/\.naturalInput\{[^}]*background:#fff;color:#0f172a;border:1px solid #64748b/);
  assert.match(source,/\.naturalInput:hover\{border-color:#0f766e\}/);
  assert.match(source,/\.naturalInput:focus-visible\{outline:3px solid #0d9488/);
  assert.match(source,/\.naturalInput:disabled\{background:#f1f5f9;color:#334155;border-color:#94a3b8;opacity:1/);
});

test("Client inline Structured Selection controls are legible across interaction states",()=>{
  assert.match(source,/\.intakeFields select,.intakeFields input\{[^}]*background:#fff;color:#0f172a/);
  assert.match(source,/\.intakeFields select:hover,.intakeFields input:hover\{border-color:#0f766e\}/);
  assert.match(source,/\.intakeFields select:focus-visible,.intakeFields input:focus-visible\{outline:3px solid #0d9488/);
  assert.match(source,/\.intakeFields select:disabled,.intakeFields input:disabled\{background:#f1f5f9;color:#334155;border-color:#94a3b8;opacity:1/);
  assert.ok(smoke.includes("Natural Language scope"));
  assert.ok(smoke.includes("Structured geography"));
  assert.ok(smoke.includes("Structured date"));
  assert.ok(smoke.includes("disabled state cannot become invisible"));
});
