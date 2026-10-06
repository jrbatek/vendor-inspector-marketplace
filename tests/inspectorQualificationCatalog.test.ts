import assert from "node:assert/strict";
import test from "node:test";
import {INSPECTOR_QUALIFICATION_CATALOG,recommendationDisclaimer,searchQualificationCatalog} from "../lib/inspector-qualification-catalog";

test("qualification catalogue covers core vendor-inspection disciplines",()=>{
 const categories=new Set(INSPECTOR_QUALIFICATION_CATALOG.map(item=>item.category));
 for(const category of ["Pressure equipment","Piping","NDT","Welding","Coatings","Electrical","Mechanical","Rotating equipment","Offshore","Lifting","Quality audits"]) assert.ok(categories.has(category as never),`missing ${category}`);
 for(const issuer of ["API","ASNT","AWS","AMPP","OPITO"]) assert.ok(INSPECTOR_QUALIFICATION_CATALOG.some(item=>item.issuer.includes(issuer)),`missing ${issuer}`);
});

test("catalogue entries point to requirement sources and carry evidence hints",()=>{
 assert.ok(INSPECTOR_QUALIFICATION_CATALOG.length>=18);
 for(const item of INSPECTOR_QUALIFICATION_CATALOG){
  assert.match(item.requirementsUrl,/^https:\/\//);
  assert.ok(item.evidenceHints.length>0);
 }
});

test("qualification search spans name issuer category and evidence",()=>{
 assert.ok(searchQualificationCatalog("welding").length>=2);
 assert.ok(searchQualificationCatalog("NDT").length>=2);
 assert.ok(searchQualificationCatalog("offshore").some(item=>item.id==="bosieth"));
 assert.equal(searchQualificationCatalog(""),INSPECTOR_QUALIFICATION_CATALOG);
});

test("recommendations are explicitly non-guaranteed and evidence based",()=>{
 const copy=recommendationDisclaimer();
 assert.match(copy,/profile evidence/i);
 assert.match(copy,/not a guarantee/i);
 assert.match(copy,/issuing body/i);
});
