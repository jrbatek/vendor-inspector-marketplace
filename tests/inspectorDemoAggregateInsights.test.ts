import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const source=fs.readFileSync("app/demo/inspector/page.tsx","utf8");
const inline=fs.readFileSync("app/demo/inspector-selection-outcomes/page.tsx","utf8");

test("Inspector sidebar displays full synthetic peer-positioning dashboard with ratings first",()=>{
 assert.match(source,/4\.9 \/ 5 · Peer insights/);
 assert.match(source,/import InspectorSelectionOutcomesDemo/);
 assert.match(source,/id="insights" className="demoSection" aria-label="Selection Insights & Feedback"><InspectorSelectionOutcomesDemo\/>/);
 assert.doesNotMatch(source,/Open Selection Insights &amp; peer comparisons/);
 assert.match(inline,/Ratings &amp; feedback/);
 assert.ok(inline.indexOf('className="ratings"') < inline.indexOf('className="comparison"'));
 assert.match(inline,/No individual selection decisions or competing inspectors are shown/);
 assert.match(inline,/minimum-cohort protections/);
});
test("embedded insights keeps standalone route intact without duplicate back navigation",()=>{
 assert.match(inline,/usePathname\(\) === "\/demo\/inspector"/);
 assert.match(inline,/className=\{embedded \? "insightsPage embedded" : "insightsPage"\}/);
 assert.match(inline,/!embedded && <Link href="\/demo\/inspector">Back to Inspector Demo<\/Link>/);
 assert.match(inline,/\.insightsPage\.embedded\{max-width:none;margin:0\}/);
 assert.doesNotMatch(inline,/supabaseBrowser|\.from\(|\.insert\(|\.update\(|\.delete\(/);
 assert.match(source,/No production inspector records are used/);
});
