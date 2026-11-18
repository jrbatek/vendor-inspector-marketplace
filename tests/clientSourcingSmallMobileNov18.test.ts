import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";
const smoke=readFileSync("scripts/smoke-client-sourcing.mjs","utf8");
const source=readFileSync("app/demo/client-agency-sourcing/page.tsx","utf8");

test("P0-B Source of Inspectors gets real built-app coverage on 320px phones",()=>{
 assert.match(smoke,/narrow\.setViewportSize\(\{ width: 320, height: 700 \}\)/);
 assert.match(smoke,/320px Source of Inspectors option clipped or too small/);
 assert.match(smoke,/320px hovered source option/);
 assert.match(smoke,/320px agency channel option clipped or too small/);
 assert.match(smoke,/320px agency selection leaked into independent inspectors/);
 assert.match(smoke,/320px Both reset failed to restore four fictional inspectors/);
 assert.match(smoke,/320px source control browser exceptions/);
});
test("source controls keep responsive text wrap and explicit contrast, no live writes",()=>{
 assert.match(source,/\.seg button\{max-width:100%;white-space:normal;overflow-wrap:anywhere;text-align:left\}/);
 assert.match(source,/\.channels button,.independent button\{width:fit-content;max-width:100%;min-width:0;white-space:normal;overflow-wrap:anywhere/);
 assert.match(source,/\.seg button\[aria-pressed=true\]\{background:#0f172a;color:#fff/);
 assert.match(source,/\.seg button:disabled/);
 assert.doesNotMatch(source,/supabaseBrowser|\.insert\(|\.update\(|fetch\(/);
});
