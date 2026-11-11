import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const hub=fs.readFileSync("app/demo/inspector/page.tsx","utf8");
const browser=fs.readFileSync("scripts/smoke-inspector-demo.mjs","utf8");

test("Synthetic inspector offered day rate is a single source of truth for list, preview and accepted confirmation",()=>{
  assert.match(hub,/id:"OP-1048",title:"API 570 Piping Inspector",project:"Gulf Horizon Refinery Upgrade"[^\n]+rate:"\$950\/day"/);
  assert.match(hub,/Offered rate: \{o\.rate\}/);
  assert.match(hub,/Offered day rate: \{opp\.rate\}/);
  assert.match(hub,/demoAction\(`Opportunity accepted at \$\{opp\.rate\} for \$\{opp\.project\}`\)/);
  assert.doesNotMatch(hub,/\$850[–-]\$1,050/);
  assert.match(hub,/Expenses and overtime are excluded unless separately agreed/);
});
test("Hosted Chromium tests validate accept, exact rate, and retained decline notice isolation",()=>{
  assert.match(browser,/Opportunity accepted at \$950\/day for Gulf Horizon Refinery Upgrade/);
  assert.match(browser,/preview day rate differs from list/);
  assert.match(browser,/Opportunity declined/);
});
