import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const main = fs.readFileSync("app/demo/inspector/page.tsx", "utf8");
for (const [name, anchor] of [
  ["inspector-documents", "qualifications"],
  ["inspector-income", "income"],
  ["inspector-work-history", "work"],
] as const) {
  test(`standalone ${name} returns to its embedded InspectorHub section`, () => {
    const source = fs.readFileSync(`app/demo/${name}/page.tsx`, "utf8");
    assert.match(source, new RegExp(`href="/demo/inspector#${anchor}"`));
    assert.doesNotMatch(source, /href="\/demo\/inspector"/);
    assert.match(source, /!embedded\s*&&/);
    assert.ok(main.includes(`id="${anchor}"`), `missing embedded #${anchor} anchor`);
  });
}
