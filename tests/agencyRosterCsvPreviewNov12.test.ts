import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {previewAgencyRosterCsv} from "../lib/agencyRosterCsvPreview";

const headers="Inspector ID,Name,Relationship,Country,Affiliation Status";
test("Agency browser-local CSV roster preview counts only anonymized aggregates",()=>{
 const value=previewAgencyRosterCsv(headers+"\nSYN-1001,Sample Inspector A,Employee,USA,Pending\nSYN-1002,Sample Inspector B,Subcontractor,Mexico,Pending\n");
 assert.deepEqual(value,{totalRows:2,validRows:2,reviewRows:0,duplicateIds:0,missingByColumn:{"Inspector ID":0,Name:0,Relationship:0,Country:0,"Affiliation Status":0}});
 assert.equal(JSON.stringify(value).includes("Sample Inspector"),false);
});
test("Agency CSV preview handles quoted commas and flags incomplete or duplicate sample IDs",()=>{
 const value=previewAgencyRosterCsv(headers+"\r\nSYN-1001,\"Sample, Inspector\",Employee,USA,Pending\r\nSYN-1001,Another Inspector,Employee,USA,Pending\r\nSYN-1003,Third Inspector,,USA,Pending\r\n");
 assert.deepEqual(value,{totalRows:3,validRows:1,reviewRows:2,duplicateIds:1,missingByColumn:{"Inspector ID":0,Name:0,Relationship:1,Country:0,"Affiliation Status":0}});
});
test("Agency roster preview rejects absent headers, unsafe file sizes and broken quotations",()=>{
 assert.throws(()=>previewAgencyRosterCsv("bad,headers\n1,2"),/Expected headers/);
 assert.throws(()=>previewAgencyRosterCsv(headers+"\n"),/no resource rows/);
 assert.throws(()=>previewAgencyRosterCsv(headers+"\n\"unfinished"),/unfinished quoted/);
 assert.throws(()=>previewAgencyRosterCsv("x".repeat(512001)),/500 KB/);
});
test("Agency Mass Resource Connect exposes a keyboard usable private preview without any upload endpoint",()=>{
 const source=readFileSync("app/demo/agency/page.tsx","utf8");
 const browser=readFileSync("scripts/smoke-agency-scrollspy.mjs","utf8");
 assert.match(source,/type="file" accept="\.csv,text\/csv"/);
 assert.match(source,/previewAgencyRosterCsv\(content\)/);
 assert.match(source,/role="status" id="agency-roster-preview"/);
 assert.match(source,/role="alert" id="agency-roster-error"/);
 assert.match(source,/browser-local.*no data is uploaded/i);
 assert.doesNotMatch(source,/fetch\(.*roster|supabaseBrowser/);
 assert.match(browser,/setInputFiles/);
 assert.match(browser,/agency-roster-preview/);
});

test("Agency CSV audit reports missing required columns without leaking inspector identities",()=>{
 const text=headers+"\nSYN-1001,,Employee,,Pending\nSYN-1001,Duplicate,Employee,USA,Pending\n,Unknown,Affiliate,Mexico,Pending\n";
 const summary=previewAgencyRosterCsv(text);
 assert.equal(summary.totalRows,3);
 assert.equal(summary.reviewRows,3);
 assert.equal(summary.duplicateIds,1);
 assert.equal(summary.missingByColumn.Name,1);
 assert.equal(summary.missingByColumn.Country,1);
 assert.equal(summary.missingByColumn["Inspector ID"],1);
 assert.equal(JSON.stringify(summary).includes("Duplicate"),false);
 assert.equal(JSON.stringify(summary).includes("SYN-1001"),false);
});
