import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";
const source=readFileSync("scripts/smoke-agency-scrollspy.mjs","utf8");
test("Agency corrected roster browser test awaits asynchronous file read and React re-render",()=>{
 for(const marker of ["/2 complete unique records/","/1 complete unique records/",'state:"detached",timeout:8000'])
  assert.ok(source.includes(marker),marker);
 const wait=source.indexOf("getByText(/1 complete unique records/).waitFor");
 const check=source.indexOf("const correctedSummary=");
 assert.ok(wait>0&&check>wait,"Corrected preview must be awaited before asserting its summary");
});
