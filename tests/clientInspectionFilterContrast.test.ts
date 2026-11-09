import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const page=fs.readFileSync("app/demo/client-inspections/page.tsx","utf8");
const smoke=fs.readFileSync("scripts/smoke-client-inspections.mjs","utf8");
test("in-progress Client Demo filters have explicit readable normal, hover, focus, disabled and invalid states",()=>{
 assert.match(page,/\.filters select,\.filters input\{color:#0f172a;background:#fff;border:1px solid #64748b/);
 assert.match(page,/\.filters select:hover,\.filters input:hover\{border-color:#1e40af/);
 assert.match(page,/\.filters select:focus-visible,\.filters input:focus-visible\{outline:3px solid #2563eb/);
 assert.match(page,/\.filters select:disabled,\.filters input:disabled\{background:#f1f5f9;color:#334155/);
 assert.match(page,/\.filters input\[aria-invalid=true\]\{border:2px solid #b91c1c/);
 assert.match(page,/aria-invalid=\{invalidDates\}/);
});
test("real Chromium validates five filter control colors and invalid date state",()=>{
 assert.match(smoke,/for \(const label of \["Status \/ stage","Project","Inspector","Scheduled from","Scheduled through"\]\)/);
 assert.match(smoke,/getComputedStyle\(element\)/);
 assert.match(smoke,/rgb\(15, 23, 42\)/);
 assert.match(smoke,/rgb\(185, 28, 28\)/);
});
