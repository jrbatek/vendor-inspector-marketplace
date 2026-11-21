import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";

const source=readFileSync("app/demo/inspector/page.tsx","utf8");
const smoke=readFileSync("scripts/smoke-inspector-demo.mjs","utf8");

test("InspectorHub textual sidebar and demo actions preserve readable 44px controls",()=>{
 assert.match(source,/\.side button\{min-height:44px;width:100%;border:0;/);
 assert.match(source,/\.panel button,\.row button,\.actions button,\.iconButton\{min-height:44px;/);
 assert.match(source,/\.iconButton\{float:right;min-width:44px\}/);
 assert.match(source,/\.side nav button\.sidebarTextLink:not\(:disabled\)\{appearance:none;background:transparent!important/);
 assert.match(source,/\.side button:focus-visible\{outline:3px solid #5eead4/);
 assert.match(smoke,/InspectorHub desktop sidebar links under 44px/);
 assert.match(smoke,/InspectorHub demo action buttons under 44px/);
 assert.match(smoke,/InspectorHub opportunity preview close control below 44px/);
});
