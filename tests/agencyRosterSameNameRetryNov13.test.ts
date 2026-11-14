import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
const page=readFileSync("app/demo/agency/page.tsx","utf8");
const smoke=readFileSync("scripts/smoke-agency-scrollspy.mjs","utf8");

test("Agency Mass Resource Connect preserves valid preview after invalid file and supports same-name retry",()=>{
 assert.match(page,/if\(!file\)return;/);
 assert.match(page,/if\(!content\.trim\(\)\)\{setRosterError\("CSV file is empty/);
 assert.match(page,/setRosterPreview\(previewAgencyRosterCsv\(content\)\)/);
 // A deliberate Clear preview button may reset the summary, but a failed
 // replacement upload must never discard the existing valid preview.
 const previewHandler=page.slice(page.indexOf("const previewRoster=async"),page.indexOf("const [reportFocus"));
 assert.ok(previewHandler.startsWith("const previewRoster=async"));
 assert.doesNotMatch(previewHandler,/setRosterPreview\(null\)/);
 assert.match(page,/event\.currentTarget\.value=""/);
 assert.doesNotMatch(page,/supabaseBrowser\(|\.insert\(|\.upsert\(/);
});
test("Chromium covers empty-file warning, preserved preview, corrected same-name retry",()=>{
 for(const marker of ["Agency CSV file input must reset to permit same-name retry","Agency empty CSV should show a readable, actionable warning","Agency empty CSV erased the previous valid synthetic roster preview","Agency same-name corrected roster was not re-previewed without a submission","Agency corrected CSV did not clear warning or reset file input"])assert.ok(smoke.includes(marker),marker);
});
