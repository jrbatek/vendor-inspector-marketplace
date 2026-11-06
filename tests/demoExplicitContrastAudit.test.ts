import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

function collectSources(root: string): string[] {
  if (!fs.existsSync(root)) return [];
  return fs.readdirSync(root, { withFileTypes: true }).flatMap(entry => {
    const current = path.join(root, entry.name);
    if (entry.isDirectory()) return collectSources(current);
    return /\.(tsx|css)$/.test(entry.name) ? [current] : [];
  });
}

const surfaces = [...collectSources("app/demo"), ...collectSources("components"), "app/globals.css"];

function cssRules(source: string, filename: string) {
  const styleBlocks = filename.endsWith(".css")
    ? [source]
    : Array.from(source.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/g), match => match[1]);
  return styleBlocks.flatMap(sheet =>
    Array.from(sheet.matchAll(/([^{}]{2,150})\{([^{}]*)\}/g), match => ({
      selector: match[1].trim().slice(-100),
      declarations: match[2],
    })),
  );
}

function declaration(css: string, property: string): string | null {
  const found = css.match(new RegExp("(?:^|;)\\s*" + property + "\\s*:\\s*([^;]+)", "i"));
  return found?.[1].trim().toLowerCase().replace(/\s*!important\s*$/, "") ?? null;
}

const whiteText = new Set(["white", "#fff", "#ffffff", "rgb(255, 255, 255)"]);
const veryLightBackground = new Set(["white", "#fff", "#ffffff", "#f8fafc", "#f9fafb", "#f1f5f9", "rgb(255, 255, 255)"]);

test("all Client, Inspector, Agency and shared demo styles reject explicit white-on-light controls", () => {
  assert.ok(surfaces.length >= 20, "Expected the demo and shared UI source tree to be scanned");
  const collisions: string[] = [];
  for (const file of surfaces) {
    const source = fs.readFileSync(file, "utf8");
    for (const rule of cssRules(source, file)) {
      const foreground = declaration(rule.declarations, "color");
      const background = declaration(rule.declarations, "background(?:-color)?");
      if (foreground && background && whiteText.has(foreground) && veryLightBackground.has(background)) {
        collisions.push(file + ": " + rule.selector + " (" + foreground + " on " + background + ")");
      }
    }
  }
  assert.deepEqual(collisions, [], "Controls must never have explicit white text on light backgrounds");
});

test("known interactive demo controls preserve distinct focus and selected states", () => {
  const calendar = fs.readFileSync("components/InspectorAvailabilityCalendar.tsx", "utf8");
  const nav = fs.readFileSync("components/Nav.tsx", "utf8");
  const inspector = fs.readFileSync("app/demo/inspector/page.tsx", "utf8");
  assert.match(calendar, /button:focus-visible/);
  assert.match(calendar, /\.viewTabs button\.selected/);
  assert.match(nav, /groupButton:focus-visible/);
  assert.match(inspector, /\.side button\.active/);
  assert.match(inspector, /\.side button:focus-visible/);
});
