import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("Client Demo CV downloads include safe fictional name and stable sample ID",()=>{
 const view=readFileSync("components/ClientDemoCandidateResults.tsx","utf8");
 const smoke=readFileSync("scripts/smoke-client-inspections.mjs","utf8");
 assert.match(view,/const safeName = candidate\.name\.trim\(\)\.replace\(\/\[\^a-zA-Z0-9\]\+\/g, "-"\)/);
 assert.match(view,/InspectSource-\$\{safeName\}-\$\{candidate\.id\}-demo-CV\.pdf/);
 assert.ok(smoke.includes("Downloaded CV filename must include the fictional inspector name"));
});
