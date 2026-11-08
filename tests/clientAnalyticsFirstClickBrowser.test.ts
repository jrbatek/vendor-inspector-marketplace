import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
test("P0 analytics smoke covers graphical browser's first quick Independent click and recovery sequence",()=>{
 const src=fs.readFileSync("scripts/smoke-client-analytics.mjs","utf8");
 assert.match(src,/A separate graphical browser observed an exception/);
 assert.match(src,/firstClick\.goto\(base\+"\/demo\/client-analytics",\{waitUntil:"domcontentloaded"\}\)/);
 assert.match(src,/firstQuick\.getByRole\("button",\{name:"Independent",exact:true\}\)\.click\(\)/);
 assert.match(src,/Fresh first-click Independent filter triggered demo analytics recovery boundary/);
 assert.match(src,/firstQuick\.getByRole\("button",\{name:"All sources"\}\)\.click\(\)/);
 assert.match(src,/firstClick\.locator\("\.filters select"\)\.first\(\)\.selectOption/);
 assert.match(src,/firstErrors\.length/);
});
