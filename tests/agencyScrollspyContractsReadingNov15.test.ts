import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const source=readFileSync("app/demo/agency/page.tsx","utf8");
const smoke=readFileSync("scripts/smoke-agency-scrollspy.mjs","utf8");

test("Agency one-page scrollspy highlights Contracts at the reading threshold, not viewport bottom",()=>{
  const update=source.slice(source.indexOf("const updateActive=()=>{"),source.indexOf("const onHash=()=>{"));
  assert.match(update,/element\.getBoundingClientRect\(\)\.top<=threshold/);
  assert.match(update,/window\.scrollY\+window\.innerHeight>=document\.documentElement\.scrollHeight-4/);
  assert.doesNotMatch(update,/lastSection\.getBoundingClientRect\(\)\.top<=Math\.max\(threshold,window\.innerHeight-16\)/);
  assert.match(smoke,/Agency Contracts reading-threshold test missed the peeking geometry/);
  assert.match(smoke,/Agency Contracts scrollspy prematurely highlighted the final section/);
  assert.match(source,/Contracts & Commercials/);
});
