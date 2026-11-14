import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const browser = readFileSync("scripts/smoke-client-analytics.mjs", "utf8");
const client = readFileSync("app/demo/client/page.tsx", "utf8");

test("hosted Chromium and Firefox exercise actual embedded Analytics, not just standalone", () => {
  assert.match(client, /<ClientAnalyticsEmbedBoundary><ClientAnalyticsDemo\/>/);
  assert.match(browser, /page\.goto\(base \+ "\/demo\/client"/);
  assert.match(browser, /#analytics \.clientAnalyticsPage/);
  assert.match(browser, /Embedded Client Analytics recovery appeared after/);
  assert.match(browser, /Embedded Client Analytics browser exception/);
  assert.match(browser, /window\.__analyticsRecoverySeen/);
  assert.match(browser, /\["Independent",15\],\["Agency",45\],\["All",60\]/);
});

test("embedded Client Demo safeguards seven records and demo-only sidebar navigation", () => {
  assert.match(client, /id="inspections-in-progress"/);
  assert.match(client, /<ClientInspectionsDemo\/>/);
  assert.match(browser, /#inspections-in-progress \.inspectionList \.inspection/);
  assert.match(browser, /Embedded Client Demo must preserve seven synthetic Inspections in Progress/);
  assert.match(browser, /Client sidebar Analytics navigation did not stay in the synthetic demo/);
  assert.match(browser, /Client Analytics filters disrupted navigation or removed the seven fictional inspections/);
  assert.match(browser, /Log in to view the client workspace/);
});
