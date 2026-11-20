import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";

const source=readFileSync("app/demo/client/page.tsx","utf8");
const smoke=readFileSync("scripts/smoke-client-inspections.mjs","utf8");

test("Client natural-language scope has a browser-local inline preview with explicit synthetic boundary",()=>{
 assert.match(source,/function previewNaturalRequest\(\)/);
 assert.match(source,/requestText\.trim\(\)\.length/);
 assert.match(source,/Enter at least 20 characters/);
 assert.match(source,/setNaturalPreview\(getDemoCandidates\(requestText\)\)/);
 assert.match(source,/Array\.isArray\(naturalPreview\) && <ClientDemoCandidateResults candidates=\{naturalPreview\}/);
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

test("invalid Client Demo uploads preserve a previously generated preview; successful scope replacements invalidate it",()=>{
  const loader=source.slice(source.indexOf("async function loadScope"),source.indexOf("function previewNaturalRequest"));
  assert.ok(loader.includes("setUploadMessage(\"\");"),"Upload validation starts with fresh feedback");
  assert.doesNotMatch(loader.slice(0,loader.indexOf("if(!loaded.trim())")) ,/setNaturalPreview\(null\)/,
    "Rejected format, oversized, unreadable or empty files must not erase an existing preview");
  assert.match(loader,/setNaturalPreview\(null\);\s*setRequestText\(loaded\)/,
    "A successfully loaded new request must invalidate the old preview");
  for(const reason of ["Unsupported scope upload erased a valid previously generated preview",
    "Oversize scope upload erased a valid previously generated preview",
    "Successful scope replacement left a stale preview visible"]){
    assert.ok(smoke.includes(reason),reason);
  }
});

test("newly uploaded Client scope or manual typing defeats stale asynchronous file reads",()=>{
  assert.match(source,/const latestScopeSelection=useRef\(0\)/);
  assert.match(source,/const selection=\+\+latestScopeSelection\.current/);
  assert.match(source,/const loaded=\(await file\.text\(\)\)\.slice\(0,MAX_REQUEST_CHARS\);\s*if\(selection!==latestScopeSelection\.current\)return/);
  assert.match(source,/if\(selection===latestScopeSelection\.current\)setUploadMessage/);
  assert.match(source,/onChange=\{e=>\{latestScopeSelection\.current\+=1;setRequestText/);
  assert.match(smoke,/Delayed Client scope upload replaced a newer selected scope/);
  assert.match(smoke,/Delayed Client scope upload overwrote manually edited requirements/);
  assert.match(smoke,/window\.__resolveSlowClientScope/);
});

test("Client Demo manual scope edits retire the previously loaded filename announcement",()=>{
  assert.match(source,/latestScopeSelection\.current\+=1;setRequestText\(e\.target\.value\);setNaturalPreview\(null\);setUploadMessage\(\"\"\)/);
  assert.match(smoke,/Manually edited Client scope retained a stale Loaded filename status/);
  assert.match(smoke,/Successful scope upload should announce its filename before any edits/);
});
