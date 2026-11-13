import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";

const source=readFileSync("app/demo/client/page.tsx","utf8");
const smoke=readFileSync("scripts/smoke-client-inspections.mjs","utf8");

test("Client natural-language scope has a browser-local inline preview with explicit synthetic boundary",()=>{
 assert.match(source,/function previewNaturalRequest\(\)/);
 assert.match(source,/requestText\.trim\(\)\.length/);
 assert.match(source,/Enter at least 20 characters/);
 assert.match(source,/No AI matching, external submission, or production record was created/);
 assert.match(source,/not personalized to this request/);
 assert.match(source,/onClick=\{previewNaturalRequest\}>Preview request \(demo\)/);
 assert.match(source,/role="status" aria-live="polite">\{naturalPreview\}/);
 assert.doesNotMatch(source,/\.insert\(|supabase|fetch\(/i);
});
test("Client scope upload rejects oversized files before reading and retains existing draft",()=>{
 assert.match(source,/const MAX_UPLOAD_BYTES=256\*1024/);
 assert.ok(source.indexOf("file.size>MAX_UPLOAD_BYTES")<source.indexOf("await file.text()"));
 assert.match(source,/your existing request was preserved/);
 assert.match(source,/catch\{/);
 assert.match(smoke,/Natural-language intake remains functional inside the same public Client Demo/);
 assert.match(smoke,/natural\.getByRole\("button",\{name:"Preview request \(demo\)"\}\)/);
 assert.match(smoke,/Buffer\.alloc\(256\*1024\+1,65\)/);
 assert.match(smoke,/Oversize scope upload replaced the user's existing draft/);
});

test("empty scope files preserve drafts and same-name uploads can be retried",()=>{
 assert.match(source,/if\(!loaded\.trim\(\)\)/);
 assert.match(source,/This scope file is empty/);
 assert.match(source,/const file=e\.currentTarget\.files\?\.\[0\];e\.currentTarget\.value=""/);
 assert.match(smoke,/Empty uploaded file erased the existing inspection scope/);
 assert.match(smoke,/Scope file input must reset to allow selecting an updated file with the same name/);
 assert.match(smoke,/Corrected same-name scope file was not loaded/);
});
