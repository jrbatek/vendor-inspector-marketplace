import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const smoke=readFileSync("scripts/smoke-client-analytics.mjs","utf8");
const validate=readFileSync(".github/workflows/validate.yml","utf8");
const qa=readFileSync(".github/workflows/autonomous-qa.yml","utf8");

test("analytics regression runs both headed and headless Chromium with identical source transitions",()=>{
  assert.match(smoke,/headless:process\.env\.ANALYTICS_HEADED !== "1"/);
  assert.match(smoke,/attempt <= 3/);
  assert.match(smoke,/MutationObserver\(record\)/);
  assert.match(smoke,/Transient analytics recovery after/);
  for(const file of [validate,qa]){
    assert.match(file,/name: Exercise client analytics in real Chromium/);
    assert.match(file,/name: Exercise Client Analytics in headed Chromium \(Xvfb\)/);
    assert.match(file,/run: ANALYTICS_HEADED=1 xvfb-run -a npm run smoke:client-analytics/);
    assert.ok(file.indexOf("headed Chromium (Xvfb)") < file.indexOf("Exercise active Client Demo in real Chromium"));
  }
});
