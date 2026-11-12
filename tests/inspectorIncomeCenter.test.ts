import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
const page=fs.readFileSync("app/demo/inspector-income/page.tsx","utf8");
const hub=fs.readFileSync("app/demo/inspector/page.tsx","utf8");
test("Income & Tax Center has fixed YTD snapshot and selectable completed years",()=>{
 assert.match(page,/2026-11-01T23:59:59-06:00/);
 assert.match(hub,/id="income" className="demoSection" aria-label="Income & Tax Center"><InspectorIncomeDemo\/>/);
 assert.doesNotMatch(hub,/Open Income &amp; Tax Center demo/);
 for(const x of ['2026 · YTD','2025','2024','Earnings Statements','Work Verification','Verified Income Reports','1099-NEC','W-2'])assert.ok(page.includes(x),x);
 assert.equal((page.match(/id:"S-\d+/g)||[]).length,9);
});
test("synthetic document downloads are functional without touching services or official forms",()=>{
 assert.match(page,/data:text\/plain;charset=utf-8/);
 assert.match(page,/encodeURIComponent/);
 assert.match(page,/download=\{/);
 assert.match(page,/year===2026/);
 assert.match(page,/no real financial statements/i);
 assert.doesNotMatch(page,/supabaseBrowser|axios|fetch\(|\.insert\(|\.update\(/);
});
test("payment preference dialog supports keyboard dismissal, focus restoration and a Tab trap",()=>{
 assert.match(page,/paymentCancel\.current\?\.focus\(\)/);
 assert.match(page,/paymentTrigger\.current\?\.focus\(\)/);
 assert.match(page,/onKeyDown=\{e=>\{/);
 assert.match(page,/e\.key==="Escape"/);
 assert.match(page,/e\.key==="Tab"/);
 assert.match(page,/e\.shiftKey/);
 assert.match(page,/aria-describedby="payment-demo-note"/);
 assert.match(page,/ref=\{paymentCancel\}/);
});

test("payment details are safely simulated with no collection of actual credentials",()=>{
 assert.match(page,/Preview payment details update/);
 assert.match(page,/Save demo preference/);
 assert.match(page,/No bank details were collected/);
 assert.match(page,/aria-modal="true"/);
 assert.doesNotMatch(page,/name="(iban|routing|account|card)"|<input/);
});
