import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("Client Demo and standalone Client Inspections never expose private Inspector calendar titles",()=>{
  const client=readFileSync("app/demo/client/page.tsx","utf8");
  const inspections=readFileSync("app/demo/client-inspections/page.tsx","utf8");
  const smoke=readFileSync("scripts/smoke-client-inspections.mjs","utf8");
  for(const [name,source] of [["Client",client],["Inspections",inspections]]){
    assert.doesNotMatch(source,/Doctor Appointment|Our Anniversary|DEMO_EVENTS/,
      name+" surface must not render inspector-private event fixtures");
  }
  assert.match(smoke,/clientVisibleText\.includes\(privateTitle\)/);
  assert.match(smoke,/inspectionVisibleText\.includes\(privateTitle\)/);
  assert.match(smoke,/Log in to view the client workspace/);
  assert.match(inspections,/ACTIVE_DEMO_INSPECTIONS\.length/);
  assert.match(inspections,/Open inspection/i);
});
