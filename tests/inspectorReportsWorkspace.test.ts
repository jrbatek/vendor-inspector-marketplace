import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const page=fs.readFileSync("app/demo/inspector-reports/page.tsx","utf8");

test("Inspector reports workspace keeps at least ten deterministic submitted reports",()=>{
 const ids=page.match(/id:"IR-/g)??[];
 assert.ok(ids.length>=10,`expected at least 10 reports, found ${ids.length}`);
 assert.match(page,/Synthetic demo/);
 assert.match(page,/no production report or client data is used/i);
});

test("Inspector reports can be filtered by client, industry and commodity",()=>{
 assert.match(page,/All clients/);
 assert.match(page,/All industries/);
 assert.match(page,/All commodities/);
 assert.match(page,/filtered\.length/);
});

test("Inspector reports expose visible working open and close controls",()=>{
 assert.match(page,/>Open report<\/button>/);
 assert.match(page,/>Close<\/button>/);
 assert.match(page,/role="dialog"/);
 assert.match(page,/aria-modal="true"/);
 assert.match(page,/button:hover/);
 assert.match(page,/button:focus-visible/);
});
