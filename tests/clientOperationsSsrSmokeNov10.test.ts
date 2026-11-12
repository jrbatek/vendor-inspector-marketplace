import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const source = fs.readFileSync("app/demo/client-operations/page.tsx","utf8");
const smoke = fs.readFileSync(".github/workflows/production-smoke.yml","utf8");

test("Client operations suspense server fallback visibly preserves its demo boundary and route-specific heading",()=>{
  assert.match(source,/fallback=\{<main aria-label="Client operations loading">/);
  assert.match(source,/<strong>Demo Mode · Synthetic data<\/strong><h1>Commercial and account management<\/h1>/);
  assert.match(source,/Loading synthetic Client Workspace/);
  assert.match(source,/<ClientOperationsDemoContent embedded=\{embedded\}\/>/);
  assert.match(smoke,/"\/demo\/client-operations"/);
  assert.match(smoke,/"Commercial and account management"/);
});
test("Client commercial pane remains driven by sidebar and query state, not redundant content buttons",()=>{
  assert.match(source,/useSearchParams\(\)/);
  assert.match(source,/selectedTab==="contracts"\|\|selectedTab==="profile"/);
  assert.match(source,/<ClientWorkspaceSidebar demo\/>/);
  assert.doesNotMatch(source,/Go to Billing|Go to Contracts|Go to Client Profile/);
});
