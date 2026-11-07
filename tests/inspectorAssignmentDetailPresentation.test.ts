import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const detail=fs.readFileSync("components/InspectorDemoAssignment.tsx","utf8");
const hub=fs.readFileSync("app/demo/inspector/page.tsx","utf8");

test("opened assignments show stage and the current fictional inspector identity",()=>{
 for (const [name,status] of [["LNG Compressor Package","FAT scheduled"],["Gulf Horizon Refinery Upgrade","Scheduled"],["Orion Deepwater Platform","Travel pending"]]){
   assert.ok(detail.includes('"'+name+'": { status: "'+status+'"'),name);
 }
 assert.match(hub,/inspector=\{p\.name\}/);
 assert.match(detail, /<dd>\{inspector\} · synthetic demo profile<\/dd>/);
 assert.match(detail,/Stage · \{detail\.status\}/);
 assert.match(detail,/inspector \}\)/);
});

test("assignment actions are clearly legible and keyboard focusable",()=>{
 assert.match(detail,/className="backButton"/);
 assert.match(detail,/className="reportLink"/);
 assert.match(detail,/\.backButton,.reportLink\{[^}]*border:1px solid #0f766e/);
 assert.match(detail,/\.backButton\{background:#0f766e;color:#fff/);
 assert.match(detail,/\.reportLink\{background:#f0fdfa;color:#115e59/);
 assert.match(detail,/\.backButton:focus-visible,.reportLink:focus-visible\{outline:3px solid #0d9488/);
 assert.match(detail,/\/api\/demo\/report\?/);
});

test("assignment detail remains synthetic with no live write interfaces",()=>{
 assert.match(detail,/DEMO-PO-4118/);
 assert.match(detail,/example\.invalid/);
 assert.doesNotMatch(detail,/supabase|\.from\(|\.insert\(|\.update\(|\.delete\(/);
});
