import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";
const page=readFileSync("app/demo/client-data/page.tsx","utf8");
const smoke=readFileSync("scripts/smoke-demo-control-visibility.mjs","utf8");
test("Client data demo export, copy and status controls retain 44px target size",()=>{
 assert.match(page,/\.exportActions button\{min-height:44px/);
 assert.match(page,/\.integrationGrid button\{min-height:44px/);
 assert.match(page,/\.exportFilterTools select,\.exportFilterTools button\{[^}]*min-height:44px/);
 assert.match(page,/\.primary:hover\{background:#115e59;color:#fff\}/);
 assert.match(page,/\.secondary:hover\{background:#99f6e4;color:#064e3b\}/);
 assert.match(page,/\.exportActions button:focus-visible,\.integrationGrid button:focus-visible\{outline:3px solid #0d9488/);
 assert.match(page,/\.exportFilterTools button:disabled\{background:#f1f5f9;color:#475569/);
});
test("real desktop/mobile browser smoke covers Client data and integrations controls",()=>{
 assert.match(smoke,/route === "\/demo\/client-data"/);
 assert.match(smoke,/\.exportActions button, \.integrationGrid button, \.exportFilterTools select, \.exportFilterTools button/);
 assert.match(smoke,/item\.height < 43\.5/);
 assert.match(smoke,/for \(const width of \[1440, 390\]\)/);
 assert.match(smoke,/body\.count !== 1/);
});
