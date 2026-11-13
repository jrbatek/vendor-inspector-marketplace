import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";
const analytics=readFileSync("app/demo/client-analytics/page.tsx","utf8");

test("completed inspections are filtered inside the Client Analytics continuous dashboard",()=>{
 assert.match(analytics, /"agency"\|"status"/);
 assert.match(analytics, /\[status,setStatus\]=useState\(ALL\)/);
 assert.match(analytics, /status===ALL\|\|row\.status===status/);
 assert.match(analytics, /\[project,projectType,country,commodity,timing,ncr,ncrType,sourceType,agency,status\]/);
 assert.match(analytics, /<Filter label="Status" value=\{status\} values=\{unique\("status"\)\}/);
 assert.match(analytics, /setStatus\(ALL\)/);
 assert.match(analytics, /key:"Status",value:status,clear:\(\)=>setStatus\(ALL\)/);
});
test("history shortcut stays in Analytics with filtered CSV, no detached history shell or live login",()=>{
 assert.match(analytics, /View completed history here/);
 assert.match(analytics, /setStatus\("Completed"\)/);
 assert.match(analytics, /scrollIntoView/);
 assert.match(analytics, /id="analytics-records"/);
 assert.match(analytics, /aria-label="Analytics slicers"/);
 assert.match(analytics, /r\.status/);
 assert.doesNotMatch(analytics, /href="\/demo\/client-history"/);
 assert.doesNotMatch(analytics, /href="\/client-dashboard"|href="\/login"/);
});
