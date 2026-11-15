import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";
const sidebar=readFileSync("components/ClientContinuousSidebar.tsx","utf8");
const browser=readFileSync("scripts/smoke-client-analytics.mjs","utf8");
test("Client sidebar scrollspy highlights reading section, not section peeking at viewport bottom",()=>{
 assert.doesNotMatch(sidebar,/last\.getBoundingClientRect\(\)\.top<=Math\.max\(threshold,window\.innerHeight-16\)/);
 assert.ok(sidebar.includes("window.scrollY+window.innerHeight>=document.documentElement.scrollHeight-4"));
 assert.ok(sidebar.includes("for(const el of elements)"));
 assert.ok(browser.includes("Client sidebar prematurely highlighted Profile when only visible at viewport bottom"));
});
