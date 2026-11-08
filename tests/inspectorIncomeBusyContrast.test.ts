import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync("app/demo/inspector-income/page.tsx","utf8");

function luminance(hex: string): number {
  const channels = hex.match(/[0-9a-f]{2}/gi);
  if (!channels || channels.length !== 3) throw new Error("Expected 6-digit hex color");
  const [r,g,b] = channels.map(part => {
    const channel = parseInt(part, 16) / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return r * 0.2126 + g * 0.7152 + b * 0.0722;
}

test("busy synthetic income PDF button has visible disabled and disabled-hover state", () => {
  assert.match(source, /disabled=\{pdfBusy\}/);
  assert.match(source, /Preparing fictional PDF/);
  const rule = source.match(/button:disabled,button:disabled:hover\{([^}]+)\}/)?.[1];
  assert.ok(rule, "Explicit local disabled and hover style required");
  assert.match(rule, /opacity:1/);
  assert.match(rule, /border-color:#94a3b8/);
  assert.match(rule, /cursor:wait/);
  const text = /color:(#[0-9a-f]{6})/.exec(rule)?.[1];
  const background = /background:(#[0-9a-f]{6})/.exec(rule)?.[1];
  assert.ok(text && background);
  const light = Math.max(luminance(text), luminance(background));
  const dark = Math.min(luminance(text), luminance(background));
  assert.ok((light + 0.05) / (dark + 0.05) >= 4.5, "Disabled PDF label must meet WCAG AA");
});

test("PDF busy styling remains synthetic-only and preserves focus visibility", () => {
  assert.match(source, /button:focus-visible,select:focus-visible/);
  assert.match(source, /No personal, payroll, tax or banking records are connected/);
  assert.doesNotMatch(source, /\.insert\(|\.update\(|supabaseBrowser/);
});
