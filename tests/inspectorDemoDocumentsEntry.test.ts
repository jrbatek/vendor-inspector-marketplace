import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const inspector=fs.readFileSync("app/demo/inspector/page.tsx","utf8");
const docs=fs.readFileSync("app/demo/inspector-documents/page.tsx","utf8");

test("InspectorHub Qualifications embeds complete synthetic evidence workflow under green sidebar",()=>{
 assert.match(inspector,/import InspectorQualificationDocumentsDemo from "\.\.\/inspector-documents\/page"/);
 assert.match(inspector,/id="qualifications" className="demoSection" aria-label="Qualifications & Documents"><InspectorQualificationDocumentsDemo\/>/);
 assert.doesNotMatch(inspector,/href="\/demo\/inspector-documents">Add Qualification/);
 assert.match(docs,/Add Qualification &amp; Upload Documentation/);
 assert.match(docs,/Recommended Additional Qualifications/);
 assert.match(docs,/type="file"/);
 assert.match(docs,/Synthetic data|synthetic/i);
});
test("Standalone qualifications remain accessible and embedded view removes nested landmark and duplicate back link",()=>{
 assert.match(docs,/usePathname\(\) === "\/demo\/inspector"/);
 assert.match(docs,/className=\{embedded \? "page embedded" : "page"\} role=\{embedded \? undefined : "main"\}/);
 assert.match(docs,/!embedded && <a href="\/demo\/inspector">Back to Inspector Demo<\/a>/);
 assert.match(docs,/\.page\.embedded\{max-width:none;margin:0;padding:0\}/);
 assert.doesNotMatch(docs,/supabaseBrowser|supabase\.from\(|\.insert\(|\.update\(|\.delete\(|XMLHttpRequest/);
 assert.match(inspector,/No production inspector records are used/);
});
