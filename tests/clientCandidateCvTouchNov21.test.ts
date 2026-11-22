import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";
const card=readFileSync("components/ClientDemoCandidateResults.tsx","utf8");
const browser=readFileSync("scripts/smoke-client-inspections.mjs","utf8");

test("fictional candidate CV disclosure is readable, keyboard-visible and tappable",()=>{
 assert.match(card,/summary \{display:flex;align-items:center;min-height:44px/);
 assert.match(card,/summary:hover,details\[open\] summary \{background:#f0fdfa;color:#115e59/);
 assert.match(card,/summary:focus-visible,button:focus-visible \{outline:3px solid #0d9488/);
 assert.match(card,/View CV/);
});
test("CV download does not lose contrast in disabled or hovered states",()=>{
 assert.match(card,/button:not\(:disabled\):hover \{background:#f0fdfa\}/);
 assert.match(card,/button:disabled \{color:#475569;background:#f1f5f9;border-color:#94a3b8;cursor:progress;opacity:1\}/);
 assert.match(card,/disabled=\{downloadState === "loading"\}/);
 assert.match(browser,/waitForEvent\("download"\)/);
});
