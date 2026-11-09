import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source=readFileSync("app/demo/agency/page.tsx","utf8");
const browser=readFileSync("scripts/smoke-agency-capacity.mjs","utf8");
test("Agency Reports and NCRs synthetic sample has usable status filtering and reset",()=>{
 assert.match(source,/const sampleReports = \[/);
 assert.match(source,/const \[reportFocus,setReportFocus\]=useState\("All findings"\)/);
 assert.match(source,/sampleReports.filter\(row=>row.findingStatus===reportFocus\)/);
 assert.match(source,/visibleSampleReports.map\(row=><tr/);
 assert.match(source,/aria-label="Sample NCR status"/);
 assert.match(source,/Reset NCR filter/);
 assert.match(source,/Showing \{visibleSampleReports.length\} of \{sampleReports.length\} fictional report\/NCR examples/);
 assert.match(source,/NCR-204/);
 assert.match(source,/NCR-198/);
 assert.match(source,/No actual client reports or case records are read or updated/);
 assert.doesNotMatch(source,/supabaseBrowser|createClient|navigator.geolocation/);
});
test("Agency NCR controls stay visually legible and exercised by real Chromium",()=>{
 assert.match(source,/\.reportTools select,\.reportTools button\{[^}]*background:#fff;color:#4c1d95/);
 assert.match(source,/\.reportTools select:focus-visible/);
 assert.match(source,/\.reportTools button:disabled\{opacity:1;background:#f1f5f9;color:#475569/);
 assert.match(browser,/name:"Sample NCR status"/);
 assert.match(browser,/NCR-204/);
 assert.match(browser,/NCR-198/);
 assert.match(browser,/Reset NCR filter/);
});
