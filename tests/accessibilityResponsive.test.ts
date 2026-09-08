import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const layout = fs.readFileSync(path.join(process.cwd(), "app/layout.tsx"), "utf8");
const nav = fs.readFileSync(path.join(process.cwd(), "components/Nav.tsx"), "utf8");
const css = fs.readFileSync(path.join(process.cwd(), "app/globals.css"), "utf8");

test("application shell provides a keyboard skip link to the main content landmark", () => {
  assert.match(layout, /className="skipLink" href="#main-content"/);
  assert.match(layout, /<main className="container" id="main-content" tabIndex=\{-1\}>/);
});

test("navigation dropdowns expose expanded state and their controlled menu", () => {
  assert.match(nav, /aria-expanded=\{openMenu === group\.label\}/);
  assert.match(nav, /aria-controls=\{menuId\}/);
  assert.match(nav, /aria-haspopup="true"/);
  assert.match(nav, /id=\{menuId\}/);
  assert.match(nav, /event\.key === "Escape"/);
});

test("global interactive controls have visible keyboard focus and useful touch targets", () => {
  assert.match(css, /:focus-visible\{outline:3px solid #2563eb;outline-offset:3px\}/);
  assert.match(css, /min-height:44px/);
  assert.match(css, /\.skipLink:focus\{transform:translateY\(0\)\}/);
});

test("small screens collapse dense layouts and respect reduced-motion preferences", () => {
  assert.match(css, /@media\(max-width:560px\)/);
  assert.match(css, /\.grid\{grid-template-columns:minmax\(0,1fr\)\}/);
  assert.match(css, /\.actions>\.button,\.actions>button\{width:100%\}/);
  assert.match(css, /@media\(prefers-reduced-motion:reduce\)/);
});
