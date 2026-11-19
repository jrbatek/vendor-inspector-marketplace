import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const sidebar=readFileSync("components/ClientContinuousSidebar.tsx","utf8");
const browser=readFileSync("scripts/smoke-client-analytics.mjs","utf8");
test("Client end-of-page scrollspy respects reading line and explicit profile deep link",()=>{
 assert.match(sidebar,/const atDocumentEnd=window\.scrollY\+window\.innerHeight>=document\.documentElement\.scrollHeight-4/);
 assert.match(sidebar,/const profileAtReadingLine=last\.getBoundingClientRect\(\)\.top<=threshold/);
 assert.match(sidebar,/profileAtReadingLine \|\| window\.location\.hash==="#profile"/);
 assert.doesNotMatch(sidebar,/if\(window\.scrollY\+window\.innerHeight>=document\.documentElement\.scrollHeight-4\)current=last\.id/);
});
test("Hosted Chromium checks Contracts and Profile active links after scroll clamping",()=>{
 for(const marker of ["Client Contracts bottom-of-page navigation incorrectly highlighted Profile",'location.hash==="#contracts"','location.hash==="#profile"'])assert.ok(browser.includes(marker),marker);
});

test("explicit Client navigation remains active during clamped smooth scroll until the user resumes scrolling",()=>{
 assert.match(sidebar,/const explicitNavigation=useRef<string\|null>\(null\)/);
 assert.match(sidebar,/explicitNavigation\.current=id/);
 assert.match(sidebar,/setActive\(requested && elements\.some\(el=>el\.id===requested\)\?requested:current\)/);
 for(const type of ["wheel","touchstart","pointerdown","keydown"]){
  assert.ok(sidebar.includes('addEventListener("'+type+'"'),"Missing navigation-lock release: "+type);
  assert.ok(sidebar.includes('removeEventListener("'+type+'"'),"Missing cleanup: "+type);
 }
});

test("Client scrollspy refreshes section registry when lazy Client dashboards mount after hydration",()=>{
 assert.match(sidebar,/const resolveElements=\(\)=>SECTIONS\.map/);
 assert.match(sidebar,/const update=\(\)=>\{\s*const elements=resolveElements\(\);/);
 assert.doesNotMatch(sidebar,/const elements=SECTIONS\.map\(\(\[id\]\)=>document\.getElementById\(id\)\)/);
});
