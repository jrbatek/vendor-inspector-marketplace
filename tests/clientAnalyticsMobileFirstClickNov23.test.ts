import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const browser = readFileSync("scripts/smoke-client-analytics.mjs","utf8");
test("hosted Chromium and Firefox probe fresh 390px and 320px first-click Analytics source selection", () => {
  assert.match(browser, /for \(const width of \[390,320\]\)/);
  assert.match(browser, /freshMobile\.goto\(base\+"\/demo\/client-analytics"/);
  assert.match(browser, /await assertCohort\(freshMobile,"Independent",15\)/);
  assert.match(browser, /await assertCohort\(freshMobile,"Agency",45\)/);
  assert.match(browser, /await assertCohort\(freshMobile,"All",60\)/);
  assert.match(browser, /mobileFirstErrors\.length/);
  assert.match(browser, /\.analyticsRecovery/);
  assert.match(browser, /rect\.width<44\|\|rect\.height<44/);
});
