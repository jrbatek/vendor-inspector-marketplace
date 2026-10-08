import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const ROOTS = ["app", "components"];
const SOURCE_EXTENSIONS = new Set([".tsx", ".ts", ".css"]);

function sourceFiles(root: string): string[] {
  const full = path.join(process.cwd(), root);
  if (!fs.existsSync(full)) return [];
  const discovered: string[] = [];
  for (const entry of fs.readdirSync(full, { withFileTypes: true })) {
    const relative = path.join(root, entry.name);
    if (entry.isDirectory()) discovered.push(...sourceFiles(relative));
    else if (SOURCE_EXTENSIONS.has(path.extname(entry.name))) discovered.push(relative);
  }
  return discovered;
}

const files = ROOTS.flatMap((root) => sourceFiles(root));

test("no JSX button is literally blank", () => {
  const offenders = files.filter((file) => {
    const source = fs.readFileSync(path.join(process.cwd(), file), "utf8");
    return /<button\b[^>]*>\s*<\/button>/i.test(source);
  });
  assert.deepEqual(offenders, [], `Blank button markup found in: ${offenders.join(", ")}`);
});

test("no inline/style-jsx rule makes controls white on white", () => {
  const offenders: string[] = [];
  for (const file of files) {
    const source = fs.readFileSync(path.join(process.cwd(), file), "utf8");
    const rules = source.match(/[^{}]+\{[^{}]*\}/g) ?? [];
    for (const rule of rules) {
      if (!/(button|\.button|Button)/i.test(rule)) continue;
      const whiteBackground = /background(?:-color)?\s*:\s*(?:#fff(?:fff)?|white)\b/i.test(rule);
      const whiteText = /(?:^|[;{])\s*color\s*:\s*(?:#fff(?:fff)?|white)\b/i.test(rule);
      if (whiteBackground && whiteText) offenders.push(file);
    }
  }
  assert.deepEqual([...new Set(offenders)], [], `White-on-white control styling found in: ${[...new Set(offenders)].join(", ")}`);
});

test("Inspector demo keeps explicit selected, hover, focus and disabled button states", () => {
  const source = fs.readFileSync(path.join(process.cwd(), "app/demo/inspector/page.tsx"), "utf8");
  assert.match(source, /\.side button\.active\{/);
  assert.match(source, /button:hover/);
  assert.match(source, /button:focus-visible/);
  assert.match(source, /button:disabled/);
});
