import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const calendar=readFileSync("components/InspectorAvailabilityCalendar.tsx","utf8");
const smoke=readFileSync("scripts/smoke-inspector-demo.mjs","utf8");
test("Inspector Calendar Week/Block Dates input/select control states remain legible",()=>{
 assert.match(calendar,/\.weekControls input,\.availabilityActions input,\.availabilityActions select\{background:#fff;color:#0f172a;border:1px solid #64748b/);
 assert.match(calendar,/\.availabilityActions select:hover\{border-color:#0f766e\}/);
 assert.match(calendar,/\.availabilityActions select:focus-visible\{outline:3px solid #0d9488/);
 assert.match(calendar,/\.availabilityActions select:disabled\{background:#f1f5f9;color:#334155/);
 assert.match(calendar,/cursor:not-allowed/);
 assert.match(calendar,/opacity:1/);
});
test("real Chromium checks Calendar form controls' text, background and border",()=>{
 assert.match(smoke,/for \(const name of \["Start date", "End date", "Availability"\]\)/);
 assert.match(smoke,/getComputedStyle\(element\)/);
 assert.match(smoke,/rgb\(15, 23, 42\)/);
 assert.match(smoke,/rgb\(255, 255, 255\)/);
});
