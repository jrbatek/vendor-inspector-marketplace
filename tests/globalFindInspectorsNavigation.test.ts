import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { demoNavigationHref } from "../lib/demoExperience";

const nav=fs.readFileSync("components/Nav.tsx","utf8");

test("global Find Inspectors link opens the live request flow outside demo mode",()=>{
 assert.match(nav,/\["Find Inspectors", "\/find-inspectors"\]/);
 assert.doesNotMatch(nav,/\["Find Inspectors", "\/demo\/client"\]/);
 assert.match(nav,/href=\{isDemoView \? demoNavigationHref\(href\) : href\}/);
});
test("same global link stays in synthetic Client Demo in demo mode",()=>{
 assert.equal(demoNavigationHref("/find-inspectors"),"/demo/client");
 assert.ok(fs.existsSync("app/demo/client/page.tsx"));
 assert.ok(fs.existsSync("app/find-inspectors/page.tsx"));
});
