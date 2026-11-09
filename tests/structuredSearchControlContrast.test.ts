import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source=readFileSync("components/InspectorFilterPage.tsx","utf8");

function luminance(hex:string){
 const rgb=hex.match(/.{2}/g)!.map(channel=>parseInt(channel,16)/255);
 return rgb.map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4)
  .reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);
}
function contrast(a:string,b:string){
 const x=luminance(a),y=luminance(b);
 return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);
}

test("structured inspector selectors specify legible resting and disabled text against explicit backgrounds",()=>{
 assert.match(source,/\.grid input,\.grid select\{[^}]*background:#fff;color:#0f172a/);
 assert.match(source,/\.grid label>span\{[^}]*color:#0f172a/);
 assert.match(source,/\.grid input:disabled,\.grid select:disabled\{background:#f1f5f9;color:#334155/);
 assert.ok(contrast("0f172a","ffffff")>=4.5);
 assert.ok(contrast("334155","f1f5f9")>=4.5);
});
test("structured inspector selectors and actions retain visible hover/focus, selected and disabled states",()=>{
 for(const marker of [
  ".grid input:hover,.grid select:hover{border-color:#0f766e}",
  ".grid input:focus-visible,.grid select:focus-visible{outline:3px solid #0d9488",
  ".reset:focus-visible{outline:3px solid #0d9488",
  ".submit button:hover{background:#1e293b;color:#fff}",
  ".submit button:focus-visible{outline:3px solid #0d9488",
  ".submit button:disabled{background:#cbd5e1;color:#334155"
 ])assert.ok(source.includes(marker),marker);
 assert.ok(contrast("ffffff","0f172a")>=4.5);
 assert.ok(contrast("ffffff","1e293b")>=4.5);
 assert.ok(contrast("334155","cbd5e1")>=4.5);
});
