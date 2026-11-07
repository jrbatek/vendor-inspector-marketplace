import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
const page=fs.readFileSync("app/demo/client/page.tsx","utf8");
test("Client Demo Upload Scope exposes a visible keyboard focus ring on the containing label",()=>{
 assert.match(page,/className="uploadButton"/);
 assert.match(page,/\.uploadButton:focus-within\{outline:3px solid #0d9488;outline-offset:3px;background:#f0fdfa\}/);
 assert.match(page,/\.uploadButton:hover\{border-color:#0f766e;background:#f0fdfa\}/);
 assert.match(page,/\.uploadButton input\{position:absolute;width:1px;height:1px/);
 assert.match(page,/Demo uploads stay in this browser and are not sent to production/);
});
