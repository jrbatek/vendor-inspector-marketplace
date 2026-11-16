import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";
const source=readFileSync("scripts/smoke-demo-control-visibility.mjs","utf8");
test("Client intake textarea and qualification selector are browser-audited for hover, focus and disabled",()=>{
 for(const phrase of ["Natural Language textarea","Structured qualification selector","keyboard focus is illegible","disabled is illegible","hover is illegible"])
  assert.ok(source.includes(phrase),phrase);
 assert.match(source,/for \(const width of \[1440, 390\]\)/);
 assert.match(source,/node\.disabled = true/);
 assert.match(source,/node\.disabled = false/);
 assert.match(source,/Number\.parseFloat\(style\.outlineWidth\) < 2/);
});
