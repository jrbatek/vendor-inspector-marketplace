import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const source=readFileSync("app/demo/inspector/page.tsx","utf8");
const smoke=readFileSync("scripts/smoke-inspector-demo.mjs","utf8");

test("Inspector continuous scrollspy waits for Income reading threshold, not viewport bottom entry",()=>{
  const block=source.slice(source.indexOf("const update=()=>{"),source.indexOf("const schedule=()=>{"));
  assert.match(block,/el\.getBoundingClientRect\(\)\.top<=threshold/);
  assert.match(block,/window\.scrollY\+window\.innerHeight>=document\.documentElement\.scrollHeight-4/);
  assert.doesNotMatch(block,/last\.getBoundingClientRect\(\)\.top<=Math\.max\(threshold,window\.innerHeight-16\)/);
  assert.match(smoke,/Income scrollspy regression did not reach the section-peeking geometry/);
  assert.match(smoke,/Inspector scrollspy prematurely highlighted Income while only peeking/);
  assert.match(source,/\["income","Income & Tax Center"\]/);
});
