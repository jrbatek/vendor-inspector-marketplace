import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

function demoPages(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(item => {
    const full = path.join(dir, item.name);
    return item.isDirectory() ? demoPages(full) : item.isFile() && item.name === "page.tsx" ? [full] : [];
  });
}

test("public demo navigation must not hard-link reviewers into live authenticated workspaces", () => {
  const pages = demoPages(path.join(process.cwd(), "app", "demo"));
  assert.ok(pages.length >= 18, "demo-route guard unexpectedly skipped pages");
  const forbidden = /(?:href\s*=\s*|redirect\s*\(\s*|(?:push|replace)\s*\(\s*)["']\/(?:client-dashboard|inspectorhub|inspector-dashboard|agency-dashboard|find-inspectors|inspectors)(?=[\/?#"'\)])/g;
  for (const page of pages) {
    const source = fs.readFileSync(page, "utf8");
    assert.deepEqual(Array.from(source.matchAll(forbidden), match => match[0]), [], `live workspace URL in public demo page ${path.relative(process.cwd(), page)}`);
  }
});

test("public Client Demo embeds seven fictional in-progress inspections without live login prompt", () => {
  const client = fs.readFileSync("app/demo/client/page.tsx", "utf8");
  const inspections = fs.readFileSync("app/demo/client-inspections/page.tsx", "utf8");
  assert.match(client, /<ClientInspectionsDemo\/>/);
  assert.match(inspections, /Seven fictional inspections/);
  assert.match(inspections, /No login required/);
  assert.doesNotMatch(inspections, /Log in to view the client workspace/);
});
