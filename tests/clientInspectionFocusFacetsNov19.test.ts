import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {ACTIVE_DEMO_INSPECTIONS as rows, EMPTY_INSPECTION_FILTERS as empty, filterActiveInspections, filterActiveInspectionsByActionDue, searchActiveInspections} from "../lib/clientActiveInspections";

const badgeCounts=(filters=empty, options={actionOwner:"",keyword:"",ncrOnly:false,dueOnly:false})=>{
  const cohort=searchActiveInspections(filterActiveInspections(rows,filters)
    .filter(row=>!options.actionOwner||row.actions.some(a=>a.owner===options.actionOwner)),options.keyword);
  const ncr=cohort.filter(row=>row.ncrs.some(n=>n.status.startsWith("Open")));
  return {
    dueCount:filterActiveInspectionsByActionDue(options.ncrOnly?ncr:cohort,true).length,
    openNcrCount:filterActiveInspectionsByActionDue(ncr,options.dueOnly).length
  };
};
test("Client focus badges are faceted by stage, project, dates, keyword and owner",()=>{
 const snapshot=JSON.stringify(rows);
 assert.deepEqual(badgeCounts(),{dueCount:2,openNcrCount:1});
 assert.deepEqual(badgeCounts({...empty,project:"North Sea Wind Array"}),{dueCount:0,openNcrCount:0});
 assert.deepEqual(badgeCounts({...empty,project:"Pacific Hydrogen Hub"}),{dueCount:1,openNcrCount:1});
 assert.deepEqual(badgeCounts({...empty,stage:"Kickoff"}),{dueCount:0,openNcrCount:0});
 assert.deepEqual(badgeCounts({...empty,from:"2026-11-19",to:"2026-11-20"}),{dueCount:0,openNcrCount:0});
 assert.deepEqual(badgeCounts(empty,{actionOwner:"Client quality lead",keyword:"",dueOnly:false,ncrOnly:false}),{dueCount:0,openNcrCount:0});
 assert.deepEqual(badgeCounts(empty,{actionOwner:"",keyword:"SAMPLE-NCR-001",dueOnly:false,ncrOnly:false}),{dueCount:1,openNcrCount:1});
 assert.deepEqual(badgeCounts(empty,{actionOwner:"",keyword:"",dueOnly:false,ncrOnly:true}),{dueCount:1,openNcrCount:1});
 assert.deepEqual(badgeCounts(empty,{actionOwner:"",keyword:"",dueOnly:true,ncrOnly:false}),{dueCount:2,openNcrCount:1});
 assert.equal(JSON.stringify(rows),snapshot);
});
test("Client focus count implementation and hosted Chromium assertions retain the same faceting contract",()=>{
 const page=readFileSync("app/demo/client-inspections/page.tsx","utf8");
 const browser=readFileSync("scripts/smoke-client-inspections.mjs","utf8");
 assert.match(page,/const focusCohort = searchActiveInspections/);
 assert.match(page,/ncrOnly \? focusOpenNcr : focusCohort/);
 assert.match(page,/filterActiveInspectionsByActionDue\(focusOpenNcr, dueOnly\)/);
 assert.match(page,/Due or overdue \(\{dueCount\}\)/);
 assert.match(page,/With open NCR \(\{openNcrCount\}\)/);
 assert.match(browser,/Due badge did not follow the selected project/);
 assert.match(browser,/NCR badge did not follow the selected project/);
 assert.match(browser,/name:"Due or overdue \(1\)"/);
});
