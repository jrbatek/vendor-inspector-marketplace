import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";

const panel=readFileSync("components/AgencyContractsPanel.tsx","utf8");
const smoke=readFileSync("scripts/smoke-agency-commercials.mjs","utf8");

test("Agency contracts disclosure has valid mounted aria-controls and accessible controls",()=>{
 assert.match(panel,/aria-expanded=\{opened===contract\.id\}/);
 assert.match(panel,/aria-controls=\{opened===contract\.id\?"contract-details-"/);
 assert.match(panel,/min-height:44px/);
 assert.match(panel,/button:focus-visible/);
 assert.match(panel,/button:disabled\{background:#cbd5e1;color:#334155/);
 assert.match(smoke,/Collapsed contract references absent details/);
});

test("Agency synthetic PDF generation feedback belongs only to its selected contract",()=>{
 assert.match(panel,/setFeedback\(\{id,kind:"success"\}\)/);
 assert.match(panel,/setFeedback\(\{id,kind:"error"\}\)/);
 assert.match(panel,/feedback\?\.id===contract\.id/);
 assert.match(panel,/role=\{feedback\.kind==="error"\?"alert":"status"\}/);
 assert.match(panel,/setFeedback\(null\);setOpened/);
 assert.doesNotMatch(panel,/\{error&&<p role="alert"/);
 assert.match(smoke,/waitForEvent\("download"/);
 assert.match(smoke,/Stale contract download message survived/);
});
