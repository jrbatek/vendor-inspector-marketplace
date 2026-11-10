import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
const page=fs.readFileSync("app/demo/client-inspections/page.tsx","utf8");
const smoke=fs.readFileSync("scripts/smoke-client-inspections.mjs","utf8");
test("invalid synthetic inspection date alert has immediately available, high-contrast date-only recovery",()=>{
  assert.match(page,/role="alert" aria-label="Invalid scheduled date range"/);
  assert.match(page,/onClick=\{clearInvalidDates\}>Clear dates in warning/);
  assert.match(page,/\.invalidDateNotice\{display:flex/);
  assert.match(page,/\.invalidDateNotice button:focus-visible/);
  assert.match(page,/\.invalidDateNotice button:hover/);
  assert.match(smoke,/getByRole\("alert",\{name:"Invalid scheduled date range"\}\)/);
  assert.match(smoke,/warningStyle\.background==="rgb\(254, 242, 242\)"/);
  assert.match(smoke,/Clear invalid date range/);
});
