import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source=readFileSync("app/demo/inspector/page.tsx","utf8");
const smoke=readFileSync("scripts/smoke-inspector-demo.mjs","utf8");

test("Inspector home action cards register deep-link history for browser back/forward",()=>{
  assert.match(source,/setSection\("opportunities"\);window\.history\.pushState\(null,"","#opportunities"\)/);
  assert.match(source,/setSection\("insights"\);window\.history\.pushState\(null,"","#insights"\)/);
  assert.match(source,/window\.addEventListener\("popstate",onHistory\)/);
  assert.match(smoke,/Home opportunities CTA did not update deep-link URL/);
  assert.match(smoke,/Back navigation did not restore InspectorHub Home/);
});

test("Calendar Open assignment keeps the URL and sidebar selected on Active Assignments",()=>{
  assert.match(source,/onOpenAssignment=\{project => \{setNotice\(""\);setNoticeSection\(null\);setAssignment\(project\);setSection\("assignments"\);window\.history\.pushState\(null,"","#assignments"\);jumpTo\("assignments"\);\}\}/);
  assert.match(smoke,/Calendar Open assignment must deep-link the assignments content/);
});
