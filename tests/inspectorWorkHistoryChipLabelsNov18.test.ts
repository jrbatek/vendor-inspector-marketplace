import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const page=readFileSync("app/demo/inspector-work-history/page.tsx","utf8");
const smoke=readFileSync("scripts/smoke-work-history-summary.mjs","utf8");

test("visible Inspector Work History active-filter chips show labels and values without literal dollar signs",()=>{
  assert.ok(page.includes('>{item.label}: {item.value} <span aria-hidden="true">×</span>'));
  assert.ok(!page.includes('>$'+'{item.label}: $'+'{item.value}'));
  assert.ok(page.includes('aria-label={`Clear ${item.label} filter: ${item.value}`}'));
});
test("real Chromium verifies visible Client filter text, not only accessible aria-label",()=>{
  assert.ok(smoke.includes('clientChip.innerText()'));
  assert.ok(smoke.includes('startsWith("Client: Bluewater LNG")'));
  assert.ok(smoke.includes('stray dollar signs or mismatched visible label'));
});
