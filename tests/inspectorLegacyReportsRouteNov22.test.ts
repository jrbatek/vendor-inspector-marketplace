import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const source=fs.readFileSync("app/demo/inspector-reports/page.tsx","utf8");
const smoke=fs.readFileSync("scripts/smoke-inspector-demo.mjs","utf8");
test("old Inspector Demo Reports route redirects into continuous Work History",()=>{
  assert.match(source,/redirect\("\/demo\/inspector#work"\)/);
  assert.doesNotMatch(source,/\/demo\/inspector-work-history/);
  assert.doesNotMatch(source,/supabase|process\.env|auth\.getUser/);
  assert.match(smoke,/page\.goto\(base \+ "\/demo\/inspector-reports"/);
  assert.match(smoke,/url\.pathname === "\/demo\/inspector" && url\.hash === "#work"/);
});
