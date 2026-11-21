import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const inspector = readFileSync("app/demo/inspector/page.tsx", "utf8");
const smoke = readFileSync("scripts/smoke-inspector-demo.mjs", "utf8");

test("P0-B opportunity modal stays inside short mobile viewports with internally scrollable actions", () => {
  for (const rule of [
    ".modal{width:100%;max-width:720px;",
    "max-height:calc(100dvh - 40px);overflow-y:auto;overscroll-behavior:contain;box-sizing:border-box",
    ".modalBack{position:fixed;inset:0;",
    'aria-modal="true"',
    'aria-label="Close opportunity preview"',
  ]) assert.ok(inspector.includes(rule), "Missing mobile dialog guard: " + rule);

  for (const marker of [
    "{width:390,height:640},{width:320,height:400}",
    'modalBounds.overflow === "auto"',
    "decline.scrollIntoViewIfNeeded()",
    "modalBounds.scrollHeight > modalBounds.clientHeight",
    "await page.setViewportSize({width:1440,height:960})",
  ]) assert.ok(smoke.includes(marker), "Missing real Chromium short-mobile smoke: " + marker);
});
