import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";
const page=readFileSync("app/demo/inspector/page.tsx","utf8");
const smoke=readFileSync("scripts/smoke-inspector-demo.mjs","utf8");
test("P0-B InspectorHub green sidebar is reachable on short desktops and normal on mobile",()=>{
 for(const marker of ["max-height:calc(100vh - 36px);overflow-y:auto;overscroll-behavior:contain;scrollbar-width:thin",
 ".side{position:static;max-height:none;overflow:visible}",
 "sidebarRef=useRef<HTMLElement|null>(null)",'ref={sidebarRef} className="side"',
 "aside.scrollTop+=item.bottom-box.bottom+inset","aside.scrollTop-=box.top+inset-item.top",
 "background:transparent!important"]){
  assert.ok(page.includes(marker),"Missing sidebar guard: "+marker);
 }
 for(const marker of ["width:1024,height:400","sideMetrics.scrollHeight>sideMetrics.clientHeight",
 'getByRole("button",{name:"Income & Tax Center"}).click()', "activeGeometry.scrollTop>0",
 "width:390,height:900"]){
  assert.ok(smoke.includes(marker),"Missing Chromium check: "+marker);
 }
});
