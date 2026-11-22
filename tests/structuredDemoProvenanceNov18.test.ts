import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";

const route=readFileSync("app/inspectors/page.tsx","utf8");
const liveSearch=readFileSync("components/InspectorFilterPage.tsx","utf8");
const demo=readFileSync("app/demo/client/page.tsx","utf8");
const smoke=readFileSync("scripts/smoke-client-inspections.mjs","utf8");

test("legacy structured demo query redirects to standalone fictional selection before mounting live searches",()=>{
 assert.match(route,/import \{ redirect \} from "next\/navigation"/);
 assert.match(route,/demoFlag==="1"/);
 assert.match(route,/redirect\("\/demo\/client#structured-selection"\)/);
 assert.match(route,/return <InspectorFilterPage\/>/);
 assert.match(liveSearch,/supabase\.from\("inspector_profiles"\)/);
 assert.match(demo,/id="structured-selection"/);
});

test("hosted Chromium checks legacy query avoids live-backed demo and ordinary /inspectors is unchanged",()=>{
 assert.match(smoke,/Legacy \?demo=1 query did not redirect to fictional Structured Selection/);
 assert.match(smoke,/Regular inspector search route was diverted to fictional demo/);
 assert.match(smoke,/Legacy structured demo query did not render seven fictional inspections/);
});
