import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const source = fs.readFileSync("app/page.tsx", "utf8");

test("homepage retains Clients, Inspectors, Agencies order and synthetic demo entry paths", () => {
  const cards = source.match(/<article className="audienceCard (?:clientCard|inspectorCard|agencyCard)"/g) || [];
  assert.deepEqual(cards, [
    '<article className="audienceCard clientCard"',
    '<article className="audienceCard inspectorCard"',
    '<article className="audienceCard agencyCard"',
  ]);
  for (const path of ["/demo/client", "/demo/inspector", "/demo/agency"]) {
    assert.ok(source.includes('href="' + path + '"'), path);
  }
  assert.doesNotMatch(source, /href="\/(?:client-dashboard|inspector-dashboard)"/);
});

test("all homepage audience action types expose visible keyboard focus and legible hover styling", () => {
  assert.match(source, /\.button:focus-visible,\.textLink:focus-visible,\.demoEntry :global\(a:focus-visible\)\{outline:3px solid #0f766e;outline-offset:3px\}/);
  assert.match(source, /\.button:hover\{filter:brightness\(\.88\);color:#fff\}/);
  assert.match(source, /\.textLink:hover,\.demoEntry :global\(a:hover\)\{color:#0f766e;text-decoration:underline/);
  assert.match(source, /\.clientButton\{background:#1d4ed8\}/);
  assert.match(source, /\.inspectorButton\{background:#0f766e\}/);
  assert.match(source, /\.agencyButton\{background:#6d28d9\}/);
});
