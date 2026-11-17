import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const page=readFileSync("app/demo/client-inspections/page.tsx","utf8");
const smoke=readFileSync("scripts/smoke-client-inspections.mjs","utf8");

test("closing and collapsing synthetic inspection details preserves the list in browser history",()=>{
 assert.match(page,/const captureListHistory=\(\)=>\(\{/);
 assert.match(page,/\[inspectionListHistoryKey\]: \{filters,sort,dueOnly,ncrOnly,actionOwner,keyword\}/);
 assert.match(page,/window\.history\.pushState\(captureListHistory\(\),/);
 assert.match(page,/window\.history\.replaceState\(captureListHistory\(\),/);
 assert.match(page,/window\.history\.replaceState\(\{\.\.\.existing, \[inspectionListHistoryKey\]:listState\}/);
 assert.doesNotMatch(page,/window\.history\.(pushState|replaceState)\(null,"",embedded\?/);
 assert.match(smoke,/Closing a filtered inspection failed to persist the list state in its new history entry/);
 assert.match(smoke,/Forward after closing an inspection did not restore its filtered list/);
});

test("filtered Client inspection history restores before initial browser-state persistence",()=>{
 assert.ok(page.includes('const [historyReady, setHistoryReady] = useState(false)'));
 assert.ok(page.includes('syncFromHash();\n    setHistoryReady(true);'));
 assert.ok(page.includes('if (!historyReady || /^#inspection-DEMO-ACT-[1-7]$/.test(window.location.hash)) return;'));
 assert.ok(page.includes('[historyReady, filters, sort, dueOnly, ncrOnly, actionOwner, keyword]'));
 assert.match(smoke,/Refreshing a filtered Client inspection list overwrote its saved browser history snapshot/);
});
