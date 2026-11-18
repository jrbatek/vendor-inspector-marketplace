import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";

const inspector=readFileSync("app/demo/inspector/page.tsx","utf8");
const smoke=readFileSync("scripts/smoke-inspector-demo.mjs","utf8");
test("Switching synthetic projects remounts assignment-local filters without affecting the mounted Calendar",()=>{
  assert.match(inspector,/<InspectorDemoAssignment key=\{assignment\} project=\{assignment\}/);
  assert.match(inspector,/<InspectorAvailabilityCalendar onOpenAssignment=\{project =>/);
  assert.match(inspector,/setAssignment\(project\)/);
  assert.doesNotMatch(inspector,/supabaseBrowser|\.insert\(|\.update\(/);
});
test("Built demo browser checks Calendar-to-Assignment switch after filtering a different project",()=>{
  assert.match(smoke,/Assignment filter setup failed before cross-project Calendar navigation/);
  assert.match(smoke,/Switching assignment via Calendar retained the previous project's filtered action state/);
  assert.match(smoke,/All actions \(2\)/);
  assert.match(smoke,/filter\(\{hasText:"Orion Deepwater Platform"\}\)/);
});
