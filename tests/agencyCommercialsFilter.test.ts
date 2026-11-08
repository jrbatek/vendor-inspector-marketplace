import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const page=fs.readFileSync("app/demo/agency-commercials/page.tsx","utf8");

test("fictional agency commercial contracts can be filtered by region",()=>{
  assert.match(page,/useState\("All regions"\)/);
  assert.match(page,/c\.region===region/);
  assert.match(page,/selectedContracts\.map/);
  assert.match(page,/selectedPerformance\.map/);
  for(const region of ["North America","Middle East","Europe"]){
    assert.match(page,new RegExp('region:"'+region+'"'));
    assert.match(page,new RegExp("<option>"+region+"</option>"));
  }
  assert.match(page,/Showing \{selectedContracts\.length\} of \{contracts\.length\} synthetic sample contracts/);
  assert.match(page,/Sample contract region/);
  assert.match(page,/Clear filter/);
});

test("contract region selection keeps synthetic demo and real financial controls separate",()=>{
  assert.match(page,/fictional contracts, rates, budgets and performance only/);
  assert.match(page,/does not execute billing/);
  assert.doesNotMatch(page,/supabaseBrowser|\.from\(/);
});
