import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";

const sidebar=readFileSync("components/ClientContinuousSidebar.tsx","utf8");
const smoke=readFileSync("scripts/smoke-client-inspections.mjs","utf8");

test("P0-B continuous Client Demo active sidebar link remains visible on short screens",()=>{
 for(const marker of [
  "asideRef=useRef<HTMLElement|null>(null)",
  'ref={asideRef} className="clientContinuousSide"',
  'nav a[aria-current="location"]',
  "aside.scrollTop+=link.bottom-outer.bottom+inset",
  "aside.scrollTop-=outer.top+inset-link.top",
  "max-height:calc(100vh - 36px);overflow-y:auto",
 ])assert.ok(sidebar.includes(marker),"Client active sidebar visibility regressed: "+marker);
 for(const marker of [
  'page.goto(base+"/demo/client#profile"',
  "width:1024,height:400",
  "aside.scrollHeight>aside.clientHeight&&aside.scrollTop>0",
  "shortClientSide.position===\"sticky\"",
  "Deep-linked Client Profile lost seven synthetic inspections",
 ])assert.ok(smoke.includes(marker),"Browser short-screen coverage missing: "+marker);
});
