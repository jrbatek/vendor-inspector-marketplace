import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source=readFileSync("app/demo/client/page.tsx","utf8");
const smoke=readFileSync("scripts/smoke-client-inspections.mjs","utf8");

test("Client Demo stacks the three owner-approved request methods at full width",()=>{
 assert.match(source, /<h2>Natural Language – AI<\/h2>/);
 assert.match(source, /<h2>Email Requirements<\/h2>/);
 assert.match(source, /<h2>Structured Selection<\/h2>/);
 assert.ok(source.indexOf("<h2>Natural Language – AI</h2>") < source.indexOf("<h2>Email Requirements</h2>"));
 assert.ok(source.indexOf("<h2>Email Requirements</h2>") < source.indexOf("<h2>Structured Selection</h2>"));
 assert.match(source, /\.requestOptions\{display:grid;grid-template-columns:minmax\(0,1fr\)/);
 assert.doesNotMatch(source, /\.requestOptions\{[^}]*repeat\(3,1fr\)/);
 assert.match(smoke, /Client methods no longer stacked vertically/);
 assert.match(smoke, /Client request methods must be full available content width/);
});

test("vertical request layout preserves browser-local scope upload and synthetic demo boundaries",()=>{
 assert.match(source, /maxLength=\{MAX_REQUEST_CHARS\}/);
 assert.match(source, /async function loadScope/);
 assert.match(source, /Demo uploads stay in this browser and are not sent to production/);
 assert.match(source, /href="\/demo\/email-requirements"/);
 assert.match(source, /href="\/demo\/client-agency-sourcing"/);
 assert.doesNotMatch(source, /supabase|createClient|\.insert\(/i);
});
