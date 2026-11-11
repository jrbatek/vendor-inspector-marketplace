import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const smoke = readFileSync("scripts/smoke-client-analytics.mjs", "utf8");

test("Firefox and Chromium exercise identical synthetic Client Analytics interactions", () => {
  assert.match(smoke, /import \{ chromium, firefox \} from "playwright"/);
  assert.match(smoke, /ANALYTICS_BROWSER \|\| "chromium"/);
  assert.match(smoke, /browserName === "firefox" \? firefox : chromium/);
  assert.match(smoke, /attempt <= 3/);
  assert.match(smoke, /MutationObserver\(record\)/);
  assert.match(smoke, /errors\.length/);
  assert.match(smoke, /assertCohort\(page,"Independent",15\)/);
});

for (const workflow of [".github/workflows/validate.yml", ".github/workflows/autonomous-qa.yml"]) {
  test(`${workflow} validates the same Analytics transitions in Firefox after Chromium`, () => {
    const content = readFileSync(workflow, "utf8");
    assert.match(content, /mcr\.microsoft\.com\/playwright:v1\.56\.1-noble/);
    assert.match(content, /Verify pinned Chromium and Firefox are installed in CI image/);
    assert.doesNotMatch(content, /npx playwright install --with-deps/);
    assert.match(content, /name: Exercise client analytics in real Chromium/);
    assert.match(content, /name: Exercise Client Analytics in headed Chromium \(Xvfb\)/);
    assert.match(content, /name: Exercise Client Analytics source transitions in Firefox/);
    assert.match(content, /run: ANALYTICS_BROWSER=firefox npm run smoke:client-analytics/);
    assert.ok(content.indexOf("headed Chromium (Xvfb)") < content.indexOf("source transitions in Firefox"));
    assert.ok(content.indexOf("source transitions in Firefox") < content.indexOf("Exercise active Client Demo"));
  });
}
