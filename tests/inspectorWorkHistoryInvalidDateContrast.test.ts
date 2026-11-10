import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const page = readFileSync("app/demo/inspector-work-history/page.tsx", "utf8");
const smoke = readFileSync("scripts/smoke-inspector-demo.mjs", "utf8");

test("Invalid synthetic Work History date inputs use visible red foreground, border and background", () => {
 assert.match(page,/aria-invalid=\{invalidDates\}/);
 assert.match(page,/\.filters input\[aria-invalid=true\]\{border:2px solid #b91c1c;background:#fff7f7;color:#7f1d1d\}/);
 assert.match(page,/role="alert"/);
});

test("Hosted Chromium tests computed invalid input colors on both dates and unchanged client recovery", () => {
 assert.match(smoke,/for \(const label of \["Completed from", "Completed through"\]\)/);
 assert.match(smoke,/Invalid Work History date input must have visible high-contrast error styling/);
 assert.match(smoke,/Recovery must preserve independently selected client/);
});
