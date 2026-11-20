import assert from "node:assert/strict";
import test from "node:test";
import { getStructuredDemoCandidates } from "../lib/clientDemoCandidates";

const defaults={region:"Gulf Coast",qualification:"API 570",start:"2026-12-07",experience:"5",source:"Both"};

test("Structured Selection returns two named fictional Houston CVs with disclosed agency/independent sources",()=>{
 const candidates=getStructuredDemoCandidates(defaults);
 assert.deepEqual(candidates.map(candidate=>candidate.id),["IS-1042","IS-1314"]);
 assert.deepEqual(candidates.map(candidate=>candidate.name),["Avery Calder","Maya Ellison"]);
 assert.deepEqual(candidates.map(candidate=>candidate.source),["Independent","Agency"]);
 assert.ok(candidates.every(candidate=>candidate.workHistory.length>0&&candidate.credentials.includes("API 570")));
});

test("Structured demo source, credentials, and experience filters never return an ineligible profile",()=>{
 assert.deepEqual(getStructuredDemoCandidates({...defaults,source:"Agency"}).map(c=>c.id),["IS-1314"]);
 assert.deepEqual(getStructuredDemoCandidates({...defaults,source:"Independent"}).map(c=>c.id),["IS-1042"]);
 assert.deepEqual(getStructuredDemoCandidates({...defaults,qualification:"API 510"}).map(c=>c.id),["IS-1314"]);
 assert.deepEqual(getStructuredDemoCandidates({...defaults,qualification:"AWS CWI"}).map(c=>c.id),["IS-1042"]);
 assert.deepEqual(getStructuredDemoCandidates({...defaults,experience:"12"}).map(c=>c.id),["IS-1042"]);
});

test("unsupported regions and invalid structured criteria fail closed without fake global coverage",()=>{
 for (const region of ["Europe","Middle East"]) assert.deepEqual(getStructuredDemoCandidates({...defaults,region}),[]);
 for (const start of ["2028-01-01","not-a-date","2026-99-01"]) assert.deepEqual(getStructuredDemoCandidates({...defaults,start}),[]);
 for (const experience of ["-1","999","not a number"]) assert.deepEqual(getStructuredDemoCandidates({...defaults,experience}),[]);
 assert.deepEqual(getStructuredDemoCandidates({...defaults,source:"Live"}),[]);
});
