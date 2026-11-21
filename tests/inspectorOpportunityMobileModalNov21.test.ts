import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const inspector = readFileSync("app/demo/inspector/page.tsx", "utf8");
const smoke = readFileSync("scripts/smoke-inspector-demo.mjs", "utf8");

test("P0-B opportunity modal stays inside short mobile viewports with internally scrollable actions", () => {
  assert.match(inspector, /\\.modal\\{width:100%;max-width:720px;/);
  assert.match(inspector, /max-height:calc\\(100dvh - 40px\\);overflow-y:auto;overscroll-behavior:contain;box-sizing:border-box/);
  assert.match(inspector, /\\.modalBack\\{position:fixed;inset:0;/);
  assert.match(inspector, /aria-modal="true"/);
  assert.match(inspector, /aria-label="Close opportunity preview"/);
  assert.match(smoke, /\\{width:390,height:640\\},\\{width:320,height:400\\}/);
  assert.match(smoke, /modalBounds\\.overflow === "auto"/);
  assert.match(smoke, /decline\\.scrollIntoViewIfNeeded\\(\\)/);
  assert.match(smoke, /modalBounds\\.scrollHeight > modalBounds\\.clientHeight/);
  assert.match(smoke, /await page\\.setViewportSize\\(\\{width:1440,height:960\\}\\)/);
});
