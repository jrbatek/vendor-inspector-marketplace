import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import test from "node:test";

const pages=[
 ["InspectorHub",readFileSync("app/inspectorhub/page.tsx","utf8")],
 ["Inspector schedule",readFileSync("app/inspectorhub/schedule/page.tsx","utf8")]
] as const;
const contrast=(a:string,b:string)=>{
 const l=(v:string)=>v.match(/.{2}/g)!.map(x=>parseInt(x,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4).reduce((sum,x,i)=>sum+x*[.2126,.7152,.0722][i],0);
 return (Math.max(l(a),l(b))+.05)/(Math.min(l(a),l(b))+.05);
};
test("InspectorHub and schedule text inputs use explicit legible foreground and all interaction states",()=>{
 for(const [label,source] of pages){
  assert.match(source,/border-radius:9px;background:#fff;color:#0f172a;font:inherit/,label);
  assert.match(source,/input:focus-visible/,label);
  assert.match(source,/outline:3px solid #0d9488/,label);
  assert.match(source,/background:#f1f5f9;color:#334155;border-color:#94a3b8;opacity:1;cursor:not-allowed/,label);
  assert.match(source,/button:disabled\{background:#cbd5e1;color:#334155;opacity:1;cursor:not-allowed\}/,label);
  assert.match(source,/button:focus-visible/,label);
 }
 for(const [fg,bg] of [["0f172a","ffffff"],["334155","f1f5f9"],["334155","cbd5e1"],["ffffff","0f172a"],["ffffff","0f766e"]] as const)assert.ok(contrast(fg,bg)>=4.5,fg+"/"+bg);
});
test("Inspector schedule native select and textarea have explicit hover, focus and disabled styles",()=>{
 const source=pages[1][1];
 assert.match(source,/input,select,textarea\{[^}]*color:#0f172a/);
 assert.match(source,/input:hover,select:hover,textarea:hover/);
 assert.match(source,/input:focus-visible,select:focus-visible,textarea:focus-visible/);
 assert.match(source,/input:disabled,select:disabled,textarea:disabled/);
 assert.match(pages[0][1],/input:hover,textarea:hover/);
 assert.match(pages[0][1],/input:disabled,textarea:disabled/);
});
