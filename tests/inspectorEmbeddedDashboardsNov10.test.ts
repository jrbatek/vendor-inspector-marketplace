import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
const hub=fs.readFileSync("app/demo/inspector/page.tsx","utf8");
const history=fs.readFileSync("app/demo/inspector-work-history/page.tsx","utf8");
const income=fs.readFileSync("app/demo/inspector-income/page.tsx","utf8");
test("Work History and Income render their complete dashboard inside the green InspectorHub sidebar shell",()=>{
 assert.match(hub,/import InspectorWorkHistoryDemo/);
 assert.match(hub,/import InspectorIncomeDemo/);
 assert.match(hub,/id="work" className="demoSection" aria-label="Work History"><InspectorWorkHistoryDemo\/>/);
 assert.match(hub,/id="income" className="demoSection" aria-label="Income & Tax Center"><InspectorIncomeDemo\/>/);
 assert.doesNotMatch(hub,/Open Work History &amp; sample inspection PDFs|Open Income &amp; Tax Center demo/);
 assert.match(history,/usePathname\(\)==="\/demo\/inspector"/);
 assert.match(income,/usePathname\(\)==="\/demo\/inspector"/);
 assert.match(history,/!embedded&&<a className="back"/);
 assert.match(income,/!embedded&&<a href="\/demo\/inspector"/);
 assert.match(history,/className=\{embedded\?"historyPage embedded":"historyPage"\}/);
 assert.match(income,/className=\{embedded\?"incomePage embedded":"incomePage"\}/);
});
test("embedded work history keeps ten assignment/report samples, filters and PDFs",()=>{
 for(const term of ["INSPECTOR_DEMO_WORK_HISTORY","filterInspectorWorkHistory","inspectorWorkReportHref","Download shown","Assignments Performed","Reports Submitted"])assert.ok(history.includes(term),term);
});
test("embedded income keeps 2026 YTD and synthetic earnings tax PDFs",()=>{
 for(const term of ["2026-11-01T23:59:59-06:00","Download synthetic income report PDF","1099-NEC / W-2","No bank details were collected"])assert.ok(income.includes(term),term);
 assert.doesNotMatch(income,/supabaseBrowser|fetch\(/);
});
test("sidebar updates history state for browser back/forward and direct section hashes",()=>{
 assert.match(hub,/window\.history\.pushState\(null,"","#"\+s\)/);
 assert.match(hub,/window\.addEventListener\("popstate",onHistory\)/);
 assert.match(hub,/window\.addEventListener\("hashchange",onHistory\)/);
});
